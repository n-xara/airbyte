import { useField } from "formik";
import { FormattedMessage } from "react-intl";
import { useEffectOnce } from "react-use";

import { Button, ModalBody, ModalFooter } from "components";

import { FormObjectArrayItem } from "core/form/types";

import { FormSection } from "./FormSection";

interface VariableInputFormProps {
  formField: FormObjectArrayItem;
  path: string;
  item?: unknown;
  disabled?: boolean;
  onDone: (value: unknown) => void;
  onCancel: () => void;
}

export const VariableInputFieldForm: React.FC<VariableInputFormProps> = ({
  formField,
  path,
  item,
  disabled,
  onDone,
  onCancel,
}) => {
  const hiddenPath = `__hidden_${path}`;
  const [field, , fieldHelper] = useField(hiddenPath);

  useEffectOnce(() => {
    // When editing an existing item update the hidden field
    if (item) {
      fieldHelper.setValue(item);
    }
  });

  return (
    <>
      <ModalBody width={430} maxHeight={300}>
        <FormSection blocks={formField.properties} path={hiddenPath} disabled={disabled} skipAppend />
      </ModalBody>
      <ModalFooter>
        <Button
          data-testid="cancel-button"
          disabled={disabled}
          secondary
          onClick={() => {
            onCancel();
            fieldHelper.setValue(undefined);
          }}
        >
          <FormattedMessage id="form.cancel" />
        </Button>
        <Button
          data-testid="done-button"
          disabled={disabled || !field.value}
          onClick={() => {
            onDone(field.value);
            fieldHelper.setValue(undefined);
          }}
        >
          <FormattedMessage id="form.done" />
        </Button>
      </ModalFooter>
    </>
  );
};
