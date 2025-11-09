import {
    faArrowUpRightFromSquare,
    faCodeBranch,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useFetch } from "../../API/API"
import type { GitData } from "../../API/Types"

// I don't like this :(
const frontendGitCommitURL = "%%%URL%%%"
const frontendGitCommitHash = "%%%COMMIT%%%"

const GitFooter = () => {
    const backendGit = useFetch<GitData>("/api/version")

    return (
        <div className="mt-3 text-center">
            {!frontendGitCommitURL.startsWith("%") && (
                <p>
                    <a
                        href={`${frontendGitCommitURL}/tree/${frontendGitCommitHash}`}
                        rel="noopener"
                        target="_blank">
                        <FontAwesomeIcon icon={faCodeBranch} className="mr-1" />
                        Frontend
                        <span className="text-monospace mx-1">
                            ({frontendGitCommitHash.substring(0, 7)})
                        </span>
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </a>
                </p>
            )}

            {backendGit && (
                <p>
                    <a
                        href={`${backendGit.url}/tree/${backendGit.revision}`}
                        rel="noopener"
                        target="_blank">
                        <FontAwesomeIcon icon={faCodeBranch} className="mr-1" />
                        Backend
                        <span className="text-monospace mx-1">
                            ({backendGit.revision.substring(0, 7)})
                        </span>
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </a>
                </p>
            )}
        </div>
    )
}

export default GitFooter
