import React, { useContext, useEffect, useRef, useState } from 'react';
import { ISysFormComponent } from '../../InterfaceBaseSimpleFormComponent';
import Switch, { SwitchProps } from '@mui/material/Switch';
import { SysFormContext } from '../../sysForm/sysForm';
import { hasValue } from '../../../../libs/hasValue';
import { ISysFormComponentRef } from '../../sysForm/typings';
import SysLabelView from '../../sysLabelView/sysLabelView';
import { SxProps, Theme } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';

interface ISysSwitchProps extends ISysFormComponent<SwitchProps> {
	/** Estilo do componente.*/
	sxMap?: {
		switch?: SxProps<Theme>;
	};
	labelPosition?: 'top' | 'start' | 'bottom' | 'end';
	valueLabel?: string;
	trueValue?: any;
	falseValue?: any;
}

const SysSwitch: React.FC<ISysSwitchProps> = ({
	name,
	label,
	value,
	defaultValue,
	onChange,
	disabled,
	loading,
	readOnly,
	error,
	showLabelAdornment,
	labelAdornment,
	showTooltip,
	tooltipMessage,
	tooltipPosition,
	labelPosition = 'end',
	valueLabel,
	trueValue = true,
	falseValue = false,
	sxMap,
	...otherProps
}) => {
	const controllerSysForm = useContext(SysFormContext);
	const inSysFormContext = hasValue(controllerSysForm);

	const refObject = !inSysFormContext ? null : useRef<ISysFormComponentRef>({ name, value: value || defaultValue });
	if (inSysFormContext) controllerSysForm.setRefComponent(refObject!);
	const schema = refObject?.current.schema;

	label = label || schema?.label;
	readOnly = readOnly || controllerSysForm.mode === 'view' || schema?.readOnly;
	disabled = disabled || controllerSysForm.disabled;
	loading = loading || controllerSysForm.loading;
	defaultValue = defaultValue || refObject?.current.value || schema?.defaultValue;
	showLabelAdornment = showLabelAdornment ?? (!!schema && !!schema?.optional);

	const [valueState, setValueState] = useState<any>(defaultValue);
	const [visibleState, setVisibleState] = useState<boolean>(refObject?.current.isVisible ?? true);
	const [errorState, setErrorState] = useState<string | undefined>(error);

	if (!visibleState) return null;

	if (inSysFormContext)
		controllerSysForm.setInteractiveMethods({
			componentRef: refObject!,
			clearMethod: () => setValueState(false),
			setValueMethod: (value) => setValueState(value),
			changeVisibilityMethod: (visible) => setVisibleState(visible),
			setErrorMethod: (error) => setErrorState(error)
		});

	const handleToggleSwitch = (e: React.BaseSyntheticEvent) => {
		const newValue = valueState === trueValue ? falseValue : trueValue;
		setValueState(newValue);
		onChange?.({ ...e, target: { ...e.target, value: newValue } });
	};

	useEffect(() => {
		if (inSysFormContext) {
			controllerSysForm?.onChangeComponentValue({ refComponent: refObject!, value: valueState });
		}
	}, [valueState]);

	useEffect(() => {
		if (hasValue(value) && value !== valueState) {
			setValueState(value);
		}
	}, [value]);

	return (
		<SysLabelView
			label={label}
			showLabelAdornment={showLabelAdornment}
			labelAdornment={labelAdornment}
			disabled={disabled}
			showTooltip={showTooltip}
			tooltipMessage={tooltipMessage}
			tooltipPosition={tooltipPosition}>
			<FormControlLabel
				value={labelPosition}
				label={valueLabel ?? (valueState ? 'Sim' : 'Não')}
				control={
					<Switch
						{...otherProps}
						name={name}
						id={name}
						key={name}
						sx={sxMap?.switch}
						value={valueState || falseValue}
						checked={valueState === trueValue}
						onChange={handleToggleSwitch}
						disabled={disabled || loading || readOnly}
					/>
				}
			/>
			{!!errorState && <FormHelperText sx={{ color: 'error.main' }}> {errorState} </FormHelperText>}
		</SysLabelView>
	);
};

export type { ISysSwitchProps };
export default SysSwitch;
