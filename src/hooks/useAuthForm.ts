import { useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react'

interface UseAuthFormOptions<T extends Record<string, string>> {
  initialValues: T
  validateField: (field: keyof T, values: T) => string | undefined
  validateForm: (values: T) => Partial<Record<keyof T, string>>
  onSubmit: (values: T) => Promise<void> | void
  liveFields?: (keyof T)[]
}

function focusFirstInvalidField(): void {
  requestAnimationFrame(() => {
    const field = document.querySelector<HTMLElement>('[aria-invalid="true"]')
    field?.focus()
  })
}

export function useAuthForm<T extends Record<string, string>>({
  initialValues,
  validateField,
  validateForm,
  onSubmit,
  liveFields = [],
}: UseAuthFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const isChecked = (field: keyof T): boolean =>
    Boolean(touched[field]) || submitAttempted || liveFields.includes(field)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof T
    const value = e.target.value
    const next = { ...values, [name]: value }
    setValues(next)

    if (isChecked(name)) {
      const error = validateField(name, next)
      setErrors((prev) => {
        const updated = { ...prev }
        if (error) updated[name] = error
        else delete updated[name]
        return updated
      })
    }
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof T
    setTouched((prev) => ({ ...prev, [name]: true }))

    const error = validateField(name, values)
    setErrors((prev) => {
      const updated = { ...prev }
      if (error) updated[name] = error
      else delete updated[name]
      return updated
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const nextErrors = validateForm(values)
    setErrors(nextErrors)
    setSubmitAttempted(true)
    setTouched(
      Object.keys(values).reduce<Partial<Record<keyof T, boolean>>>((acc, key) => {
        acc[key as keyof T] = true
        return acc
      }, {}),
    )

    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalidField()
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setValues(initialValues)
    setTouched({})
    setErrors({})
    setSubmitAttempted(false)
    setIsSubmitting(false)
  }

  return { values, errors, isSubmitting, isChecked, handleChange, handleBlur, handleSubmit, reset }
}
