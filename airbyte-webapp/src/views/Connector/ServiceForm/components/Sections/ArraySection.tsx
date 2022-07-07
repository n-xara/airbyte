import { FieldArray, useField } from "formik";
import React, { useMemo } from "react";
import { FormattedMessage } from "react-intl";

import { ArrayOfObjectsEditor, Button, ModalBody, ModalFooter } from "components";
import GroupControls from "components/GroupControls";

import { FormBlock, FormGroupItem, FormObjectArrayItem } from "core/form/types";

import { useServiceForm } from "../../serviceFormContext";
import { SectionContainer } from "./common";
import { FormSection } from "./FormSection";

interface ArraySectionProps {
  formField: FormObjectArrayItem;
  path: string;
  disabled?: boolean;
}

const getItemName = (item: Record<string, string>): string => {
  return Object.keys(item)
    .sort()
    .map((key) => `${key}: ${item[key]}`)
    .join(" | ");
};

const getItemDescription = (item: Record<string, string>, properties: FormBlock[]): React.ReactNode => {
  const rows = Object.keys(item)
    .sort()
    .map((key) => {
      const property = properties.find(({ fieldKey }) => fieldKey === key);
      const name = property?.title ?? key;
      const value = item[key];
      return (
        <tr key={key}>
          <td style={{ paddingRight: 10 }}>{name}:</td>
          <td>{value}</td>
        </tr>
      );
    });

  return (
    <table>
      <tbody>{rows}</tbody>
    </table>
  );
};

export const ArraySection: React.FC<ArraySectionProps> = ({ formField, path, disabled }) => {
  const { addUnfinishedFlow, removeUnfinishedFlow, unfinishedFlows } = useServiceForm();
  const [field, , form] = useField(path);

  const items = useMemo(() => field.value ?? [], [field.value]);

  const { renderItemName, renderItemDescription } = useMemo(() => {
    const { properties } = formField.properties as FormGroupItem;

    const details = items.map((item: Record<string, string>) => {
      const name = getItemName(item);
      const description = getItemDescription(item, properties);
      return {
        name,
        description,
      };
    });

    return {
      renderItemName: (_: unknown, index: number) => details[index].name,
      renderItemDescription: (_: unknown, index: number) => details[index].description,
    };
  }, [items, formField.properties]);

  const flow = unfinishedFlows[path];

  return (
    <GroupControls
      name={path}
      key={`form-variable-fields-${formField?.fieldKey}`}
      title={formField.title || formField.fieldKey}
      description={formField.description}
    >
      <SectionContainer>
        <FieldArray
          name={path}
          render={(arrayHelpers) => (
            <ArrayOfObjectsEditor
              editableItemIndex={flow?.id}
              onStartEdit={(index) =>
                addUnfinishedFlow(path, {
                  id: index,
                  startValue: index < items.length ? items : null,
                })
              }
              onRemove={arrayHelpers.remove}
              items={items}
              renderItemName={renderItemName}
              renderItemDescription={renderItemDescription}
              disabled={disabled}
            >
              {() => (
                <ModalBody width={430} maxHeight={300}>
                  <FormSection
                    blocks={formField.properties}
                    path={`${path}.${flow.id}`}
                    disabled={disabled}
                    skipAppend
                  />
                  <ModalFooter>
                    <Button
                      onClick={() => {
                        removeUnfinishedFlow(path);

                        if (flow.startValue) {
                          form.setValue(flow.startValue);
                        }
                      }}
                      type="button"
                      secondary
                      disabled={disabled}
                    >
                      <FormattedMessage id="form.cancel" />
                    </Button>
                    <Button
                      onClick={() => removeUnfinishedFlow(path)}
                      type="button"
                      data-testid="done-button"
                      disabled={disabled}
                    >
                      <FormattedMessage id="form.done" />
                    </Button>
                  </ModalFooter>
                </ModalBody>
              )}
            </ArrayOfObjectsEditor>
          )}
        />
      </SectionContainer>
    </GroupControls>
  );
};
