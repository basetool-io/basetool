import { Views } from "./enums";
import EmptyComponent from "./components/EmptyComponent";
import dynamic from "next/dynamic";

export const useFieldComponent = () => {
  const getField = (fieldType: string, view: Views) => {
    const viewName = {
      [Views.edit]: "Edit",
      [Views.new]: "Edit",
      [Views.show]: "Show",
      [Views.index]: "Index",
    };

    try {
      return dynamic(
        () => {
          try {
            return import(
              `@/plugins/fields/${fieldType}/${viewName[view]}.tsx`
            );
          } catch (error) {
            // return empty component
            return Promise.resolve(() => "");
          }
        },
        // {
        //   loading: EmptyComponent,
        // }
      );
    } catch (error) {
      // return empty component
      return () => "";
    }
  };

  return getField;
};
