import { EditorState } from '@codemirror/state'
import {
  EditorView,
  ViewUpdate,
  highlightSpecialChars,
  keymap,
} from '@codemirror/view'
import { bracketMatching } from '@codemirror/matchbrackets'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
import { commentKeymap } from '@codemirror/comment'
import { completionKeymap } from '@codemirror/autocomplete'
import { defaultHighlightStyle } from '@codemirror/highlight'
import { defaultKeymap } from '@codemirror/commands'
import {
  flatten, isEmpty, isNull, isNumber, isString, isUndefined,
} from 'lodash'
import { foldGutter, foldKeymap } from '@codemirror/fold'
import { historyKeymap } from '@codemirror/history'
import { javascript } from '@codemirror/lang-javascript'
import { lineNumbers } from '@codemirror/gutter'
import { lintKeymap } from '@codemirror/lint'
import { searchKeymap } from '@codemirror/search'
// import { useAppSelector } from '@/src/hooks/state'
// import Handlebars from 'handlebars'

import { EditFieldProps } from "@/features/fields/types";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";
import { fieldId } from "@/features/fields";
import EditFieldWrapper from "@/features/fields/components/FieldWrapper/EditFieldWrapper";
import React, { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

const Edit = ({
  field,
  formState,
  register: registerMethod,
  setValue,
  schema,
}: EditFieldProps, ref: any) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editorData, setEditorData] = useState(field.value)
  const [compiledValue, setCompiledValue] = useState('')
  useImperativeHandle(ref, () => ({ field, editorView, editorRef }), [field, editorView, editorRef])
  const cmOptions = useMemo(() => ({
    lineNumbers: false,
    mode: 'multi-js',
    gutter: true,
    lineWrapping: true,
    viewportMargin: Infinity,
    autoCloseBrackets: true,
    rows: 10,
    // ...options,
  }), [])
  const handleChange = (v: ViewUpdate) => {
    // const handleChange = (v: ViewUpdate) => {
    if (v.docChanged) {
      // Document changed

      const editorValue = v.state.doc.toString()

      if (isString(editorValue)) {
        // If any of the annotations have `type` as text ("insert", "delete", etc.) it means it's a use input.
        // If it's an integer, then it's a value change from a component re-render
        const isUserInputChange = !isEmpty(
          flatten(v.transactions.map((t) => (t as any).annotations)).filter(
            (t) => !isNumber(t.value),
          ),
        )

        // Re-set the state and view because they changed and they aren't reactive.
        setEditorView(v.view)

        // Set the editorData to be parsed
        setEditorData(editorValue)

        if (isUserInputChange && setValue) {
          // Trigger the change to the parent component
          try {
            setValue(
              register.name,
              editorValue,
              {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              })
          } catch (error) {

          }
        }
      }
    }
  }

  const getEditorExtensions = useMemo(
    () => {
      // console.log('getEditorExtensions')

      let extensions = [
        // highlightActiveLineGutter(),
        highlightSpecialChars(),
        // history(),
        // drawSelection(),
        EditorState.allowMultipleSelections.of(true),
        // indentOnInput(),
        defaultHighlightStyle.fallback,
        bracketMatching(),
        closeBrackets(),
        // autocompletion(),
        // rectangularSelection(),
        // highlightActiveLine(),
        // highlightSelectionMatches(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...commentKeymap,
          ...completionKeymap,
          ...lintKeymap,
        ]),
      ]

      if (cmOptions.lineNumbers) {
        extensions = [...extensions, lineNumbers(), foldGutter()]
      }

      return [
        ...extensions,
        javascript(),
        EditorView.updateListener.of(handleChange),
      ]
    },
    [field.value, setValue],
  )

  const mountEditor = () => {
    console.log('editorRef->', editorRef)
    if (editorRef.current) {
      const state = EditorState.create({
        doc: field.value as string,
        extensions: getEditorExtensions,
      })
      const view = new EditorView({
        state,
        parent: editorRef.current,
      })

      // Keep the view and state in sync
      setEditorView(view)
    }
  }

  const destroyEditor = () => {
    if (editorView && window) {
      editorView.destroy()

      setEditorView(undefined)
    }
  }

  useEffect(() => {
    mountEditor()

    return () => destroyEditor()
  }, [])

  useEffect(() => {
    if (!isUndefined(editorView)) {
      const editorValue = editorView.state.doc.toString()
      const newValue = field.value

      if (newValue !== editorValue) {
        destroyEditor()
        mountEditor()
      }
    }
  }, [field.value])
  // const queryableData = useAppSelector(queryableDataSelector)

  const [editorView, setEditorView] = useState<EditorView>()

  // --

  const register = registerMethod(field.column.name);
  const errors = useMemo(() => formState.errors, [formState])
  const { name } = register;

  const [jsonError, setJsonError] = useState<string | null>(null);

  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);
  const helpText = null;
  const hasHelp = !isNull(helpText);

  const placeholder = field.column.fieldOptions.placeholder;

  let initialValue = "{}";
  try {
    initialValue = isUndefined(field.value)
      ? "{}"
      : JSON.stringify(JSON.parse(field.value as string), null, 2);
  } catch (e) {
    initialValue = "{}";
  }

  const handleOnChange = (value: string) => {
    if (isEmpty(value)) {
      if (setValue) {
        setValue(
          register.name,
          {},
          {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          }
        );
      }
    } else {
      if (setValue) {
        let parsedValue;
        try {
          parsedValue = JSON.parse(value);
          setJsonError(null);
        } catch (e) {
          setJsonError("Error parsing the JSON!");
        }
        if (parsedValue) {
          setValue(register.name, parsedValue, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      }
    }
  };

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <FormControl
        isInvalid={(hasError) || !isNull(jsonError)}
        id={fieldId(field)}
      >
        <div ref={editorRef} />
        {/* <Textarea
          rows={10}
          placeholder={placeholder as string}
          id={fieldId(field)}
          defaultValue={initialValue}
          onChange={(e) => {
            handleOnChange(e.currentTarget.value);
          }}
        /> */}
        {hasHelp && <FormHelperText>{helpText}</FormHelperText>}
        <FormErrorMessage>
          {errors[name]?.message || jsonError}
        </FormErrorMessage>
      </FormControl>
    </EditFieldWrapper>
  );
};

export default forwardRef(Edit);

