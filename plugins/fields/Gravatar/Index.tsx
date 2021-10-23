import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { GravatarFieldOptions } from "./types";
import { isNull } from "lodash";
import Image from "next/image";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";
import classNames from "classnames";
import md5 from "md5";

const Index = ({ field }: { field: Field }) => {
  const value = field.value ? field.value.toString() : "";
  const dimensions =
    (field.column.fieldOptions as GravatarFieldOptions)?.showDimensions || 340;

  const src = `https://www.gravatar.com/avatar/${md5(value)}?s=${dimensions}`;
  const indexDimensions =
    (field.column.fieldOptions as GravatarFieldOptions)?.indexDimensions || 40;

  return (
    <IndexFieldWrapper field={field} flush={true}>
      {isNull(field.value) && <Code>null</Code>}
      {isNull(field.value) || (
        <Image
          className={classNames("min-w-10", {
            "rounded-full": field.column.fieldOptions.rounded,
          })}
          src={src}
          width={indexDimensions}
          height={indexDimensions}
          alt={value}
          title={value}
        />
      )}
    </IndexFieldWrapper>
  );
};

export default memo(Index);
