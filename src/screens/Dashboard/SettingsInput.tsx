import { SettingsListSetting } from 'lib/settings';
import { Form } from 'semantic';
import { HelpTip } from 'components';
import React from 'react';

interface Props<T> {
  item: SettingsListSetting<T>;
  value?: string;
  onChange: (
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: { name?: string; value?: unknown }
  ) => void;
}

export default function SettingsInput<T>({ item, value, onChange }: Props<T>) {
  return (
    <>
      {item.type === 'dropdown' ? (
        <Form.Select
          key={item.key?.toString()}
          label={
            <strong
              style={{
                marginBottom: '4px',
                display: 'inline-block',
              }}>
              {item.name}
              {item.description && <HelpTip text={item.description} />}
            </strong>
          }
          options={item.options?.map((i) => ({ text: i, value: i })) || []}
          name={item.key}
          value={value}
          onChange={onChange}
        />
      ) : (
        <Form.Input
          key={item.key?.toString()}
          label={
            <strong
              style={{
                marginBottom: '4px',
                display: 'inline-block',
              }}>
              {item.name}
              {item.description && <HelpTip text={item.description} />}
            </strong>
          }
          name={item.key}
          value={value}
          onChange={(e, { name, value }) =>
            onChange(e, {
              name,
              value: item.type === 'number' ? Number(value) : value,
            })
          }
        />
      )}
    </>
  );
}
