import type { Schema, Struct } from '@strapi/strapi';

export interface ContactContactFormField extends Struct.ComponentSchema {
  collectionName: 'components_contact_form_fields';
  info: {
    description: 'Individual form field configuration';
    displayName: 'Form Field';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    placeholder: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    type: Schema.Attribute.Enumeration<
      ['text', 'email', 'tel', 'textarea', 'select', 'number']
    > &
      Schema.Attribute.DefaultTo<'text'>;
  };
}

export interface ContactGlobalContactForm extends Struct.ComponentSchema {
  collectionName: 'components_contact_global_contact_forms';
  info: {
    description: 'Contact form configuration for global use';
    displayName: 'Global Contact Form';
  };
  attributes: {
    description: Schema.Attribute.Text;
    formFields: Schema.Attribute.Component<'contact.contact-form-field', true>;
    submitButtonText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Submit'>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Contact Us'>;
  };
}

export interface SolutionMetricItem extends Struct.ComponentSchema {
  collectionName: 'components_metric_items';
  info: {
    description: '';
    displayName: 'Metric Item';
    icon: 'check';
  };
  attributes: {
    label: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

export interface SolutionSolutionListItem extends Struct.ComponentSchema {
  collectionName: 'components_solution_list_items';
  info: {
    description: '';
    displayName: 'solution-list-item';
    icon: 'list';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    description: Schema.Attribute.RichText;
    icon: Schema.Attribute.Media<'images'>;
    metrics: Schema.Attribute.Component<'solution.metric-item', true>;
    name: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'contact.contact-form-field': ContactContactFormField;
      'contact.global-contact-form': ContactGlobalContactForm;
      'solution.metric-item': SolutionMetricItem;
      'solution.solution-list-item': SolutionSolutionListItem;
    }
  }
}
