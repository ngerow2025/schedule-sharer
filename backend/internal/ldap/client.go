package ldap

import (
	"fmt"
	"log"
	"net"
	"math/rand"
	"time"

	"github.com/go-ldap/ldap/v3"
)

// LDAPClient wraps the connection and configuration for an LDAP server.
type LDAPClient struct {
	BindCN   string
	BindPW   string
	Server   string
	Port     int
	conn     *ldap.Conn
}

// Connect performs SRV lookup and binds to the first available LDAP server.
func (c *LDAPClient) Connect() error {
	cname, srvs, err := net.LookupSRV("ldap", "tcp", "csh.rit.edu") 
	if err != nil {
		return fmt.Errorf("failed SRV lookup: %w", err)
	}

	if len(srvs) == 0 {
		return fmt.Errorf("no LDAP servers found for cname %s", cname)
	}

	rand.Seed(time.Now().UnixNano())
	selected := srvs[rand.Intn(len(srvs))]


	target := selected.Target
	port := int(selected.Port)
	c.Server = target
	c.Port = port

	log.Printf("Connecting to LDAP server %s:%d (target: %s)", target, port, cname)

	conn, err := ldap.DialURL(fmt.Sprintf("ldap://%s:%d", target, port))
	if err != nil {
		return fmt.Errorf("failed to connect to LDAP server: %w", err)
	}

	c.conn = conn

	if err := c.conn.Bind(c.BindCN, c.BindPW); err != nil {
		conn.Close()
		return fmt.Errorf("failed to bind to LDAP server: %w", err)
	}

	log.Println("Successfully connected and bound to LDAP server")
	return nil
}

// Close releases the LDAP connection.
func (c *LDAPClient) Close() {
	if c.conn != nil {
		c.conn.Close()
	}
}

type CSHUser struct {
	Username string
	FullName string
	UniqueID string
}

// GetUsers retrieves all users from the LDAP directory.
func (c *LDAPClient) GetUsers() ([]*CSHUser, error) {
	searchRequest := ldap.NewSearchRequest(
		"cn=users,cn=accounts,dc=csh,dc=rit,dc=edu",
		ldap.ScopeWholeSubtree,
		ldap.NeverDerefAliases,
		0, 0, false,
		"(uid=*)",
		[]string{"ipaUniqueID", "uid", "cn"},
		nil,
	)

	result, err := c.conn.Search(searchRequest)
	if err != nil {
		return nil, fmt.Errorf("failed to execute search request: %w", err)
	}

	log.Printf("LDAP users query returned %d entries", len(result.Entries))

	users := make([]*CSHUser, len(result.Entries))
	for i, entry := range result.Entries {
		users[i] = &CSHUser{
			Username: entry.GetAttributeValue("uid"),
			FullName: entry.GetAttributeValue("cn"),
			UniqueID: entry.GetAttributeValue("ipaUniqueID"),
		}
	}

	return users, nil
}
