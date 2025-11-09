/*


// import {
//   useOidcFetch,
//   // useOidc,
//   // useOidcAccessToken,
//   // useOidcIdToken,
// } from "@axa-fr/react-oidc";
// import {useEffect, useState} from "react";
// import {apiPrefix} from "../configuration";
// import {Link} from "react-router-dom";
// import Authenticating from "../callbacks/Authenticating";
// import AuthenticationError from "../callbacks/AuthenticationError";
// import SessionLost from "../callbacks/SessionLost";
// import UserInfo from "../UserInfo";
import "./styles.css"
import "csh-material-bootstrap/dist/csh-material-bootstrap.css";


const MySchedule = () => {
    // important hooks
    // const {idToken, idTokenPayload} = useOidcIdToken(); // this is how you get the users id token
    // const {login, logout, isAuthenticated} = useOidc(); // this gets the functions to login and logout and the logout state
    // const {accessTokenPayload} = useOidcAccessToken(); // this contains the user info in raw json format
    // const userInfo = accessTokenPayload as UserInfo;

    //   const {fetch} = useOidcFetch();

    //   const [data, setData] = useState<string | null>(null);
    // Just an example of how to get data from an API!
    //   useEffect(() => {
    //     let cancelled = false;
    //     fetch(`${apiPrefix}/demo`)
    //       .then((res) => res.json())
    //       .then((res) => {
    //         if (cancelled) {
    //           return;
    //         }
    //         setData(res.someValue);
    //       });

    //     return () => {
    //       cancelled = true;
    //     };
    //   }, [fetch]);

    return (
        <div>
            <h1 className="display-3">My Schedule</h1>
            <div>
                <div
                    className="panel panel-default panel-control-overlap"
                    ng-controller="GenerateNonCourseItemsController"
                >
                    <div className="panel-heading form-horizontal">
                        <div className="form-horizontal row">
                            <div className="col-xs-12">
                                <h2 className="panel-title">
                                    Non-Course Schedule Items
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div
                        className="panel-body"
                        ng-show="state.nonCourses.length > 0"
                    >
                        <div
                            className="container row form-group repeat-item"
                            ng-repeat="nonCourse in state.nonCourses"
                        >
                            <div className="col-lg-2 col-md-12">
                                <div className="container-fluid">
                                    <input
                                        autoComplete="off"
                                        id="nonCourses{{$index}}"
                                        className="form-control"
                                        ng-model="nonCourse.title"
                                        type="text"
                                        name="nonCourses{{$index}}"
                                        placeholder="Title"
                                    />
                                </div>
                            </div>
                            <div className="hidden-lg vert-spacer-static-md"></div>
                            <div className="col-lg-5 col-md-6 col-sm-6">
                                <div className="row form-inline">
                                    <div className="col-xs-12">
                                        <div className="form-group inline-sm">
                                            <select
                                                id="options-startTime"
                                                ng-change="ensureCorrectEndTime($index)"
                                                className="form-control"
                                                ng-model="nonCourse.startTime"
                                                ng-options="key as ui.optionLists.timesHalfHours.values[key] for key in ui.optionLists.timesHalfHours.keys"
                                            >
                                                <option value="">Start</option>
                                            </select>
                                        </div>
                                        <div className="form-group inline-sm">
                                            &nbsp;to&nbsp;
                                        </div>
                                        <div className="form-group inline-sm">
                                            <select
                                                id="options-endTime"
                                                className="form-control"
                                                ng-model="nonCourse.endTime"
                                                ng-options="key as ui.optionLists.timesHalfHours.values[key] for key in ui.optionLists.timesHalfHours.keys | startFrom: ui.optionLists.timesHalfHours.keys.indexOf(nonCourse.startTime) + 1"
                                            >
                                                <option value="">End</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden-lg vert-spacer-static-md"></div>
                            <div className="col-lg-4 col-sm-5">
                                <div className="container-fluid">
                                    <div dow-select-fields="nonCourse.days"></div>
                                </div>
                            </div>
                            <div className="hidden-md hidden-lg vert-spacer-static-md"></div>
                            <div className="col-sm-1">
                                <div className="container-fluid">
                                    <button
                                        type="button"
                                        className="btn btn-danger hidden-xs"
                                        ng-click="removeNonC($index)"
                                    >
                                        <i className="fa fa-times"></i>
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-block visible-xs"
                                        ng-click="removeNonC($index)"
                                    >
                                        <i className="fa fa-times"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="panel-footer">
                        <div className="row">
                            <div className="col-md-4 col-md-offset-8">
                                <button
                                    type="button"
                                    className="btn btn-block btn-primary"
                                    ng-click="addNonC()"
                                >
                                    <i className="fa fa-plus"></i> Add Item
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MySchedule;
*/


import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Button,
  ButtonGroup
} from 'reactstrap';
// You would need to install react-icons for the icons
// npm install react-icons
import { FaPlus, FaTimes } from 'react-icons/fa';

// --- TYPE DEFINITIONS ---

/** Represents a single non-course schedule item */
interface INonCourseItem {
  id: string; // Unique ID for React key
  title: string;
  startTime: number; // Stored as minutes from midnight (e.g., 9:30am = 570)
  endTime: number;
  days: string[]; // Array of day abbreviations, e.g., ['Mo', 'We', 'Fr']
}

/** Represents a single option in the time dropdowns */
interface ITimeOption {
  value: number;
  label: string;
}

// --- HELPER DATA & FUNCTIONS ---

const daysOfWeek: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Generates the list of time options in 30-minute increments.
 */
const generateTimeOptions = (): ITimeOption[] => {
  const options: ITimeOption[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
    const hours = Math.floor(minutes / 60);
    const min = minutes % 60;
    const period = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = min === 0 ? '00' : '30';
    
    options.push({
      value: minutes,
      label: `${displayHours}:${displayMinutes}${period}`,
    });
  }
  // Add 12:00am (end of day)
  options.push({ value: 1440, label: '12:00am' });
  return options;
};

// Generate the options once
const allTimeOptions: ITimeOption[] = generateTimeOptions();
const defaultStartTime = 480; // 8:00am
const defaultEndTime = 570;   // 9:30am

/** Creates a new, blank non-course item */
const createNewItem = (): INonCourseItem => ({
  id: crypto.randomUUID(),
  title: '',
  startTime: defaultStartTime,
  endTime: defaultEndTime,
  days: [],
});

// --- ROW SUB-COMPONENT ---

interface INonCourseItemRowProps {
  item: INonCourseItem;
  onRemove: (id: string) => void;
  onChange: (id: string, field: keyof INonCourseItem, value: string | number) => void;
  onDayToggle: (id: string, day: string) => void;
}

const NonCourseItemRow: React.FC<INonCourseItemRowProps> = ({
  item,
  onRemove,
  onChange,
  onDayToggle,
}) => {

  // Filter end time options to only show times *after* the selected start time
  const availableEndTimes = allTimeOptions.filter(
    (opt) => opt.value > item.startTime
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Handle text input vs. select (which returns a string number)
    const newValue = name === 'title' ? value : parseInt(value, 10);
    onChange(item.id, name as keyof INonCourseItem, newValue);
  };

  return (
    <FormGroup row className="mb-3 align-items-center">
      {/* Title Input */}
      <Col lg="2" md="12" className="mb-2 mb-lg-0">
        <Input
          type="text"
          name="title"
          placeholder="Title"
          value={item.title}
          onChange={handleInputChange}
          autoComplete="off"
        />
      </Col>

      {/* Time Selectors */}
      <Col lg="5" md="6" sm="6" className="mb-2 mb-sm-0">
        <Row className="g-2 align-items-center">
          <Col xs="auto">
            <Input
              type="select"
              name="startTime"
              value={item.startTime}
              onChange={handleInputChange}
            >
              <option value="" disabled>Start</option>
              {allTimeOptions.slice(0, -1).map(opt => ( // Exclude last 12:00am
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Input>
          </Col>
          <Col xs="auto" className="px-1">
            to
          </Col>
          <Col xs="auto">
            <Input
              type="select"
              name="endTime"
              value={item.endTime}
              onChange={handleInputChange}
            >
              <option value="" disabled>End</option>
              {availableEndTimes.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Input>
          </Col>
        </Row>
      </Col>

      {/* Day of Week Selector */}
      <Col lg="4" sm="5" className="mb-2 mb-sm-0">
        <ButtonGroup>
          {daysOfWeek.map((day) => (
            <Button
              key={day}
              color={item.days.includes(day) ? 'success' : 'secondary'}
              outline
              onClick={() => onDayToggle(item.id, day)}
            >
              {day}
            </Button>
          ))}
        </ButtonGroup>
      </Col>

      {/* Delete Button */}
      <Col sm="1">
        {/* Hidden on xs screens */}
        <Button
          color="danger"
          onClick={() => onRemove(item.id)}
          className="d-none d-sm-block"
          aria-label="Delete item"
        >
          <FaTimes />
        </Button>
        {/* Visible only on xs screens */}
        <Button
          color="danger"
          block
          onClick={() => onRemove(item.id)}
          className="d-block d-sm-none"
        >
          <FaTimes /> Delete
        </Button>
      </Col>
    </FormGroup>
  );
};


// --- MAIN COMPONENT ---

const NonCourseScheduler: React.FC = () => {
  const [nonCourses, setNonCourses] = useState<INonCourseItem[]>([
    // Start with one item by default
    createNewItem(),
  ]);

  /** Adds a new blank item to the list */
  const handleAddItem = () => {
    setNonCourses([...nonCourses, createNewItem()]);
  };

  /** Removes an item from the list by its ID */
  const handleRemoveItem = (id: string) => {
    setNonCourses(nonCourses.filter((item) => item.id !== id));
  };

  /** Updates a specific field on a specific item */
  const handleItemChange = (
    id: string,
    field: keyof INonCourseItem,
    value: string | number
  ) => {
    setNonCourses(
      nonCourses.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const updatedItem = { ...item, [field]: value };

        // Logic from 'ensureCorrectEndTime'
        // If startTime changed, check if endTime is still valid.
        // If not, set it to the first valid time after the new startTime.
        if (field === 'startTime') {
          if (updatedItem.endTime <= (value as number)) {
            const firstValidEndTime = allTimeOptions.find(
              (opt) => opt.value > (value as number)
            );
            updatedItem.endTime = firstValidEndTime
              ? firstValidEndTime.value
              : 1440; // Default to end of day if somehow invalid
          }
        }
        return updatedItem;
      })
    );
  };

  /** Toggles a day in the item's 'days' array */
  const handleDayToggle = (id: string, day: string) => {
    setNonCourses(
      nonCourses.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const daysSet = new Set(item.days);
        if (daysSet.has(day)) {
          daysSet.delete(day);
        } else {
          daysSet.add(day);
        }
        return { ...item, days: Array.from(daysSet) };
      })
    );
  };

  return (
    <Card>
      <CardHeader>
        <Row className="form-horizontal">
          <Col xs="12">
            <CardTitle tag="h2">Non-Course Schedule Items</CardTitle>
          </Col>
        </Row>
      </CardHeader>

      <CardBody>
        {nonCourses.length > 0 && (
          <Form>
            {nonCourses.map((item) => (
              <NonCourseItemRow
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                onChange={handleItemChange}
                onDayToggle={handleDayToggle}
              />
            ))}
          </Form>
        )}
      </CardBody>

      <CardFooter>
        <Row>
          <Col md={{ size: 4, offset: 8 }}>
            <Button color="primary" block onClick={handleAddItem}>
              <FaPlus /> Add Item
            </Button>
          </Col>
        </Row>
      </CardFooter>
    </Card>
  );
};

export default NonCourseScheduler;