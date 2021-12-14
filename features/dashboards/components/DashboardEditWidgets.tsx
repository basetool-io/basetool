import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from "@chakra-ui/react";
import { PlusCircleIcon, PlusIcon } from "@heroicons/react/outline";
import { Widget } from "@prisma/client";
import {
  activeWidgetNameSelector,
  setActiveColumnName,
  setActiveWidgetName,
} from "@/features/records/state-slice";
import { snakeCase } from "lodash";
import { toast } from "react-toastify";
import { useAddWidgetMutation } from "../api-slice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useDashboardResponse } from "../hooks";
import { useDataSourceContext } from "@/hooks";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import Shimmer from "@/components/Shimmer";
import TinyLabel from "@/components/TinyLabel";
import classNames from "classnames";

const WidgetItem = ({
  widget,
}: {
  widget: Widget;
}) => {
  const dispatch = useAppDispatch();
  const activeWidgetName = useAppSelector(activeWidgetNameSelector);

  const toggleWidgetSelection = () => {
    if (activeWidgetName === widget?.name) {
      dispatch(setActiveWidgetName(""));
    } else {
      dispatch(setActiveWidgetName(widget.name));
    }
  };

  return (
    <div
      className={classNames(
        "relative flex items-center justify-between cursor-pointer group rounded",
        {
          "bg-blue-600 text-white": activeWidgetName === widget.name,
          "hover:bg-gray-100":
          activeWidgetName !== widget.name,
        }
      )}
    >
      <div className="flex items-center flex-1 hover:cursor-pointer">
        <div
          className="flex-1 flex items-center justify-between"
          onClick={toggleWidgetSelection}
        >
          <span className="flex items-center">
            <span className="ml-1">{widget.name}</span>{" "}
          </span>
        </div>
      </div>
    </div>
  );
};

const NameInput = forwardRef((props: any, ref: any) => {
  return (
    <FormControl>
      <FormLabel htmlFor="name">Name</FormLabel>
      <Input ref={ref} id="name" size="sm" {...props} />
      <FormHelperText>What should the widget be called.</FormHelperText>
    </FormControl>
  );
});
NameInput.displayName = "NameInput";

// 2. Create the form
const Form = ({
  firstFieldRef,
  onClose,
}: {
  firstFieldRef: any;
  onClose: () => void;
}) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [addWidget, { isLoading }] = useAddWidgetMutation();
  const { dashboardId } = useDataSourceContext();
  const { widgets } = useDashboardResponse(dashboardId);

  const widgetExists = () =>
  widgets.some((widget: Widget) => widget.name === snakeCase(name));

  const createWidget = async () => {
    if (name.length < 4) return;

    // close popover
    onClose();

    const response = await addWidget({
      dashboardId,
      body: {
        dashboardId,
        name: name,
      },
    }).unwrap();

    if (response?.ok) {
      // select the newly created widget
      dispatch(setActiveWidgetName(name));
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        if (widgetExists()) {
          toast.error("A widget with that name already exists.");

          return;
        }

        // Clear the input value
        setName("");
        firstFieldRef.current.value = "";

        createWidget();
      }}
    >
      <NameInput
        ref={firstFieldRef}
        onChange={(e: any) => setName(e.currentTarget.value)}
      />
      <div className="mt-2">
        <Button
          type="submit"
          size="sm"
          colorScheme="blue"
          width="100%"
          isDisabled={name.length < 4}
          isLoading={isLoading}
          leftIcon={<PlusIcon className="text-white h-4" />}
        >
          Add widget
        </Button>
      </div>
    </form>
  );
};

const DashboardEditWidgets = () => {
  const dispatch = useAppDispatch();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { dashboardId } = useDataSourceContext();
  const firstFieldRef = useRef(null);

  const { isLoading: dashboardIsLoading, widgets } =
  useDashboardResponse(dashboardId);

  useEffect(() => {
    return () => {
      dispatch(setActiveColumnName(""));
    }
  }, [])

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <TinyLabel>Widgets</TinyLabel>{" "}
          <span className="text-xs text-gray-600">(click to edit)</span>
        </div>
        <div className="flex items-center">
          <Popover
            isOpen={isOpen}
            initialFocusRef={firstFieldRef}
            onOpen={onOpen}
            onClose={onClose}
          >
            <PopoverTrigger>
              <div className="flex justify-center items-center h-full mx-1 text-xs cursor-pointer">
                <PlusCircleIcon className="h-4 inline mr-px" /> Add
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverBody>
                <Form firstFieldRef={firstFieldRef} onClose={onClose} />
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="mt-2">
        {dashboardIsLoading && (
          <div className="space-y-1">
            <Shimmer height="15px" width="60px" />
            <Shimmer height="15px" width="160px" />
            <Shimmer height="15px" width="120px" />
            <Shimmer height="15px" width="80px" />
            <Shimmer height="15px" width="140px" />
            <Shimmer height="15px" width="210px" />
            <Shimmer height="15px" width="90px" />
            <Shimmer height="15px" width="110px" />
          </div>
        )}
        {!dashboardIsLoading &&
          widgets &&
          widgets.map((widget: Widget, idx: number) => (
            <WidgetItem key={idx} widget={widget}/>
          ))}
      </div>
    </div>
  );
};

export default DashboardEditWidgets;
