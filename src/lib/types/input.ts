export interface BaseInput {
    id: string;
    type?: string;
    label?: string;
    display?: string;
}

export interface RangeInput extends BaseInput {
    type: "range";
    label: string;
    range_min: string;
    range_max: string;
    range_step: string;
}

export interface SelectInput extends BaseInput {
    type: "select";
    label: string;
    selectors: string[];
}

export interface MultiButtonInput extends BaseInput {
    type: "multi_button";
    label: string;
    selectors: Array<{
        value: string;
        icon: string;
    }>;
}

export interface ExportInput extends BaseInput {
    type: "export";
    label: string;
    icon: string;
    description: string;
    value: null;
}

export interface ColorInput extends BaseInput {
    type: "color";
    label: string;
}

export interface TextInput extends BaseInput {
    type: "text";
    label: string;
}

export interface CheckboxInput extends BaseInput {
    type: "checkbox";
    label: string;
}

export interface FileInput extends BaseInput {
    type: "file";
    label: string;
}

export type Input = RangeInput | SelectInput | MultiButtonInput | ExportInput | ColorInput | TextInput | CheckboxInput | FileInput | BaseInput;

export interface Category {
    title: string;
    inputs: Input[];
} 