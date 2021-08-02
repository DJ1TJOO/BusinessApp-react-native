import { useState, useContext } from "react";

import dataContext from "../contexts/dataContext";

/**
 * @param {Array<String>} keys
 * @param {Array<{
 *  key: String,
 *  value: any
 * }>} values
 * @param {Array<{
 * 	key: String,
 * 	validator: (formData, data, value) => String|Boolean
 * }>} validators
 * @returns {[
 * {[key]:{
 * 	value: any,
 * 	valid: boolean | null
 * 	validator: (value) => String|Boolean | null
 * }},
 * (key) => (value, valid) => void,
 * (key) => {
 * 	onChange: (value, valid) => void,
 * 	validator?: (value) => String|Boolean
 * 	value?: any
 * },
 * () => Boolean | {key: String, error: String},
 * React.Dispatch<React.SetStateAction<{}>>]}
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
	const [data] = useContext(dataContext);

	const setFormValue = (key) => {
		const validator = formData[key].validator;
		return (value, valid = undefined) => {
			if (typeof valid === "undefined") {
				if (validator) valid = validator(formData, data, value) === true ? true : false;
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
			props.validator = formData[key].validator.bind(undefined, formData, data);
		}

		if (formData[key].value) {
			props.value = formData[key].value;
		}

		return props;
	};

	const validate = () => {
		for (const key in formData) {
			const set = formData[key];

			if (set.validator) {
				const error = set.validator(formData, data, set.value);
				if (error !== true) {
					return {
						key,
						error,
					};
				} else if (!set.valid) {
					set.valid = true;
				}
			} else if (!set.valid) {
				return {
					key,
					error: "empty",
				};
			}
		}

		return true;
	};

	return [formData, setFormValue, getFormProps, validate, setFormData];
};

export default useFormData;
