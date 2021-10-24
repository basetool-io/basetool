import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { isNull, merge } from "lodash";
import Image from "next/image";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";
import classNames from "classnames";
import fieldOptions from "./fieldOptions";
import md5 from "md5";

const Index = ({ field }: { field: Field }) => {
  const value = field.value ? field.value.toString() : "";
  const options = merge(fieldOptions, field.column.fieldOptions);
  const src = `https://www.gravatar.com/avatar/${md5(value)}?s=${
    options.indexDimensions
  }`;

  return (
    <IndexFieldWrapper field={field} flush={true}>
      {isNull(field.value) && <Code>null</Code>}
      {isNull(field.value) || (
        <div className="relative flex items-center h-full">
          <Image
            className={classNames({
              "rounded-full": field.column.fieldOptions.rounded,
            })}
            src={src}
            width={options.indexDimensions}
            height={options.indexDimensions}
            alt={value}
            title={value}
          />
        </div>
      )}
    </IndexFieldWrapper>
  );
};

export default memo(Index);
