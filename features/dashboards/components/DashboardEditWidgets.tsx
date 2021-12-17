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
  Portal,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from "@chakra-ui/react";
import { ItemTypes } from "@/lib/ItemTypes";
import { MINIMUM_WIDGET_NAME_LENGTH } from "@/lib/constants";
import {
  MinusIcon,
  PlusCircleIcon,
  PlusIcon,
  VariableIcon,
} from "@heroicons/react/outline";
import { Widget } from "@prisma/client";
import {
  activeWidgetIdSelector,
  setActiveWidgetId,
} from "@/features/records/state-slice";
import { iconForWidget } from "..";
import { isArray, isEqual, snakeCase, sortBy } from "lodash";
import { toast } from "react-toastify";
import { useAddWidgetMutation, useReorderWidgetsMutation } from "../api-slice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useDashboardResponse } from "../hooks";
import { useDataSourceContext } from "@/hooks";
import { useDrag, useDrop } from "react-dnd";
import DashedCreateBox from "@/components/DashedCreateBox";
import DragIcon from "@/components/DragIcon";
import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import Shimmer from "@/components/Shimmer";
import TinyLabel from "@/components/TinyLabel";
import classNames from "classnames";
import update from "immutability-helper";

const WidgetItem = ({
  widget,
  moveWidget,
}: {
  widget: Widget;
  moveWidget: any;
}) => {
  const dispatch = useAppDispatch();
  const activeWidgetId = useAppSelector(activeWidgetIdSelector);
  const IconElement = iconForWidget(widget);

  const toggleWidgetSelection = () => {
    if (activeWidgetId === widget?.id) {
      dispatch(setActiveWidgetId(null));
    } else {
      dispatch(setActiveWidgetId(widget.id));
    }
  };

  const id = widget.name;
  const [{ item, isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.WIDGET,
      item: { id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
      }),
    }),
    [moveWidget, id]
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.WIDGET,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
      canDrop: () => false,
      hover(item: { id: string }) {
        const draggedWidgetName = item.id;
        const overWidgetName = widget.name;
        if (draggedWidgetName !== overWidgetName && moveWidget) {
          moveWidget(draggedWidgetName, overWidgetName);
        }
      },
    }),
    [moveWidget, id]
  );

  return (
    <div
      className={classNames(
        "relative flex items-center justify-between cursor-pointer group rounded",
        {
          "bg-blue-600 text-white": activeWidgetId === widget.id,
          "hover:bg-gray-100":
            activeWidgetId !== widget.id ||
            (!isDragging && item?.id === widget?.name),
          "!bg-gray-800 opacity-25":
            isOver || (isDragging && item?.id === widget?.name),
        }
      )}
      ref={preview}
    >
      <div className="flex items-center flex-1 hover:cursor-pointer">
        <span ref={(node: any) => drag(drop(node))} className="h-full ml-1">
          <DragIcon />{" "}
        </span>
        <div
          className="flex-1 flex items-center justify-between"
          onClick={toggleWidgetSelection}
        >
          <span className="flex items-center">
            <IconElement className="h-4 self-start mt-1 ml-1 mr-2 lg:self-center lg:mt-0 inline-block flex-shrink-0" />{" "}
            <span>{widget.name}</span>{" "}
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
  type,
}: {
  firstFieldRef: any;
  onClose: () => void;
  type: string;
}) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [addWidget, { isLoading }] = useAddWidgetMutation();
  const { dashboardId } = useDataSourceContext();
  const { widgets } = useDashboardResponse(dashboardId);

  const widgetExists = () =>
    widgets.some((widget: Widget) => widget.name === snakeCase(name));

  const createWidget = async () => {
    if (name.length < MINIMUM_WIDGET_NAME_LENGTH) return;

    // close popover
    onClose();

    const response = await addWidget({
      dashboardId,
      body: {
        dashboardId,
        name,
        type,
      },
    }).unwrap();

    if (response?.ok) {
      // select the newly created widget
      dispatch(setActiveWidgetId(response.data.id));
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
          isDisabled={name.length < MINIMUM_WIDGET_NAME_LENGTH}
          isLoading={isLoading}
          leftIcon={<PlusIcon className="text-white h-4" />}
        >
          Add {type}
        </Button>
      </div>
    </form>
  );
};

const DashboardEditWidgets = () => {
  const dispatch = useAppDispatch();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { dashboardId } = useDataSourceContext();
  const firstFieldRefMetric = useRef(null);
  const firstFieldRefDivider = useRef(null);

  const { isLoading: dashboardIsLoading, widgets } =
    useDashboardResponse(dashboardId);

  const [order, setOrder] = useState<string[]>([]);

  useEffect(() => {
    if (isArray(widgets)) {
      const newOrder = sortBy(widgets, [(w) => w?.order]).map(
        ({ name }: Widget) => name
      );
      setOrder(newOrder);
    }
  }, [widgets]);

  const orderedWidgets = useMemo(
    () => sortBy(widgets, [(widget: Widget) => order.indexOf(widget.name)]),
    [widgets, order]
  );

  const [{ didDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.WIDGET,
    collect: (monitor) => ({
      didDrop:
        monitor.getItemType() === ItemTypes.WIDGET ? monitor.didDrop() : false,
    }),
  }));

  const [reorderWidgets] = useReorderWidgetsMutation();

  const moveWidget = (from: string, to: string) => {
    const fromIndex = order.indexOf(from);
    const toIndex = order.indexOf(to);

    const newOrder = update(order, {
      $splice: [
        [fromIndex, 1],
        [toIndex, 0, from],
      ],
    }).filter(Boolean);

    if (!isEqual(order, newOrder)) {
      setOrder(newOrder);
    }
  };

  // We have to save the order of the widgets when the order changes, and the order changes when an element is dropped.
  useEffect(() => {
    if (didDrop === true) {
      reorderWidgets({
        dashboardId,
        body: { order },
      }).unwrap();
    }
  }, [didDrop]);

  useEffect(() => {
    return () => {
      dispatch(setActiveWidgetId(null));
    };
  }, []);

  const ContentForPopover = () => (
    <Portal>
      <PopoverContent
        rootProps={{
          style: {
            zIndex: 40,
          },
        }}
      >
        <PopoverArrow />
        <PopoverBody>
          <Tabs isFitted>
            <TabList size="sm">
              <Tab>
                Metric{" "}
                <VariableIcon className="h-4 self-start mt-1 ml-1 mr-2 lg:self-center lg:mt-0 inline-block flex-shrink-0" />
              </Tab>
              <Tab>
                Divider{" "}
                <MinusIcon className="h-4 self-start mt-1 ml-1 mr-2 lg:self-center lg:mt-0 inline-block flex-shrink-0" />
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Form
                  firstFieldRef={firstFieldRefMetric}
                  onClose={onClose}
                  type="metric"
                />
              </TabPanel>
              <TabPanel>
                <Form
                  firstFieldRef={firstFieldRefDivider}
                  onClose={onClose}
                  type="divider"
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </PopoverBody>
      </PopoverContent>
    </Portal>
  );

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <TinyLabel>Widgets</TinyLabel>{" "}
          {widgets.length > 0 && (
            <span className="text-xs text-gray-600">(click to edit)</span>
          )}
        </div>
        {widgets.length > 0 && (
          <div className="flex items-center">
            <Popover
              isOpen={isOpen}
              initialFocusRef={firstFieldRefMetric}
              onOpen={onOpen}
              onClose={onClose}
            >
              <PopoverTrigger>
                <div className="flex justify-center items-center h-full mx-1 text-xs cursor-pointer">
                  <PlusCircleIcon className="h-4 inline mr-px" /> Add
                </div>
              </PopoverTrigger>
              <ContentForPopover />
            </Popover>
          </div>
        )}
      </div>
      {widgets.length === 0 && (
        <Popover
          isOpen={isOpen}
          initialFocusRef={firstFieldRefMetric}
          onOpen={onOpen}
          onClose={onClose}
        >
          <PopoverTrigger>
            <div>
              <DashedCreateBox>Create widget</DashedCreateBox>
            </div>
          </PopoverTrigger>
          <ContentForPopover />
        </Popover>
      )}
      <div className="mt-2" ref={drop}>
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
          orderedWidgets &&
          orderedWidgets.map((widget: Widget, idx: number) => (
            <WidgetItem key={idx} widget={widget} moveWidget={moveWidget} />
          ))}
      </div>
    </div>
  );
};

export default DashboardEditWidgets;
