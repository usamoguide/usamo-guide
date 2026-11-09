import { StoryFn } from '@storybook/react-webpack5';
import React from 'react';

export default {
  title: 'Button',
};

const Template: StoryFn = args => <button {...args}>My button</button>;

export const Default = Template.bind({});
Default.args = {
  className: 'btn-legacy',
};

export const Small = Template.bind({});
Small.args = {
  className: 'btn-legacy btn-legacy-sm',
};

export const Primary = Template.bind({});
Primary.args = {
  className: 'btn-primary',
};

export const Disabled = Template.bind({});
Disabled.args = {
  className: 'btn-legacy',
  disabled: true,
};
