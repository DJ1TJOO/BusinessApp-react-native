import { useState } from "react";

/**
 * @param {Array<String>} keys
 * @param {Array<{
 *  key: String,
 *  value: any
 * }>} values
 * @param {Array<{
 * 	key: String,
 * 	validator: (formData, value) => String|Boolean
 * }>} validators
 * @returns {[{[key]:{
 * 	value: any,
 * 	valid: boolean | null
 * 	validator: (value) => String|Boolean | null
 * }}, (key) => (value, valid) => void, (key) => {
 * 	onChange: (value, valid) => void,
 * 	validator?: (value) => String|Boolean
 * 	value?: any
 * }]}
 */
const useFormData = (keys, values, validators) => {
	const defaultData = keys.reduce(
		(defaultData, key) => ({
			...defaultData,
			[key]: {
				value: values.find((value) => value.key === key)?.value || null,
				valid: null,
				validator: validators.find((validator) => validator.key === key)?.validator || null,
			},
		}),
		{}
	);

	const [formData, setFormData] = useState(defaultData);

	const setFormValue = (key) => {
		const validator = formData[key].validator;
		return (value, valid = undefined) => {
			if (typeof valid === "undefined") {
				if (validator) valid = validator(formData, value) === true ? true : false;
				else valid = null;
			}

			setFormData({
				...formData,
				[key]: {
					value: value,
					valid: valid,
					validator: validator,
				},
			});
		};
	};

	const getFormProps = (key) => {
		const props = { onChange: setFormValue(key) };

		if (formData[key].validator) {
			props.validator = formData[key].validator.bind(undefined, formData);
		}

		if (formData[key].value) {
			props.value = formData[key].value;
		}

		return props;
	};

	const validate = () => {
		for (const key in formData) {
			const set = formData[key];

			if (!set.valid) {
				const error = set.validator(formData, set.value);
				return {
					key,
					error,
				};
			}
		}

		return true;
	};

	return [formData, setFormValue, getFormProps, validate, setFormData];
};

export default useFormData;
