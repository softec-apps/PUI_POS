'use client'

import React from 'react'
import { Control, UseFormSetValue } from 'react-hook-form'
import { SelectFieldZod } from '@/components/layout/atoms/SelectFieldZod'
import { I_Template } from '@/modules/template/types/template'
import { ProductFormData } from './ModalForm'

interface Props {
  control: Control<ProductFormData>
  setValue: UseFormSetValue<ProductFormData>
  templates: I_Template[]
  loadingTemplates: boolean
  value: string
}

export function TemplateSelector({ control, setValue, value, templates, loadingTemplates }: Props) {
	const templateOptions =
		templates?.map(template => ({
			value: template.id,
			label: template.name,
		})) || []
	return (
		<div>
			<SelectFieldZod
				control={control}
				name='templateId'
				label='Plantilla'
				options={templateOptions}
				required
				value={value?.id}
				onChange={value => {
					const template = templates.find(t => t.id === value)
					setValue('templateId', template, { shouldDirty: true })
				}}
				isLoading={loadingTemplates}
			/>
		</div>
	)
}
