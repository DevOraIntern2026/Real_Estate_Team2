import { useState, type ChangeEvent, type FormEvent } from 'react'
import type { InquiryPayload, PropertyOwner } from '../types/types'
import { isValidEmail } from '../utils/utils'
import { submitInquiry } from '../mocks/mockData'

interface ContactAgentCardProps {
  propertyId: string
  agent: PropertyOwner
}

type FormValues = Omit<InquiryPayload, 'propertyId'>
type FormErrors = Partial<Record<keyof FormValues, string>>
const initialValues: FormValues = {
  fullName: '',
  email: '',
  phone: '',
  message: '',
}

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {}
  if (!v.fullName.trim()) e.fullName = 'Enter your full name'
  if (!v.email.trim()) e.email = 'Enter your email'
  else if (!isValidEmail(v.email)) e.email = 'Enter a valid email address'
  if (!v.phone.trim()) e.phone = 'Enter your phone number'
  else if (!/^\d{8,12}$/.test(v.phone.replace(/\s/g, '')))
    e.phone = 'Enter a valid phone number'
  if (!v.message.trim()) e.message = 'Write your inquiry'
  return e
}

export default function ContactAgentCard({
  propertyId,
  agent,
}: ContactAgentCardProps) {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>(
    'idle',
  )

  const onChange =
    (field: keyof FormValues) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }))
      if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }))
    }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setStatus('sending')
    try {
      await submitInquiry({ propertyId, ...values })
      setValues(initialValues)
      setStatus('sent')
    } catch {
      setStatus('failed')
    }
  }

  const wrap = (field: keyof FormValues) =>
    `textfield ${errors[field] ? 'textfield--error' : ''}`
  const helper = (field: keyof FormValues) =>
    errors[field] && (
      <p className="textfield__helper textfield__helper--error">
        {errors[field]}
      </p>
    )

  return (
    <aside className="rounded-outer border-border-grey-shade bg-main-white col-start-3 row-span-2 row-start-1 h-fit border p-6">
      <h2 className="text-title-24 font-semibold text-[#0f0f3d]">
        Contact agent
      </h2>

      <div className="mt-3 flex items-center gap-3">
        <img
          src={agent.avatar}
          alt={agent.name}
          className="size-12 rounded-full object-cover"
        />
        <div className="text-label-14 leading-5">
          <p className="font-medium">{agent.name}</p>
          <p>{agent.phone}</p>
          <p>{agent.email}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-4 flex flex-col gap-4">
        <div className={wrap('fullName')}>
          <label htmlFor="inq-name" className="textfield__label">
            Full Name
          </label>
          <div className="textfield__control">
            <input
              id="inq-name"
              className="textfield__input"
              placeholder="Full Name"
              value={values.fullName}
              onChange={onChange('fullName')}
            />
          </div>
          {helper('fullName')}
        </div>

        <div className={wrap('email')}>
          <label htmlFor="inq-email" className="textfield__label">
            Your Email
          </label>
          <div className="textfield__control">
            <input
              id="inq-email"
              type="email"
              className="textfield__input"
              placeholder="Enter your email"
              value={values.email}
              onChange={onChange('email')}
            />
          </div>
          {helper('email')}
        </div>

        <div className={wrap('phone')}>
          <label htmlFor="inq-phone" className="textfield__label">
            Your Phone
          </label>
          <div className="textfield__control text-overflow-ellipsis overflow-hidden whitespace-nowrap">
            <span className="text-label-14 border-border-grey-shade flex items-center gap-2 border-r pr-3">
              <span aria-hidden>🇪🇬</span> +020
            </span>
            <input
              id="inq-phone"
              type="tel"
              inputMode="numeric"
              className="textfield__input"
              placeholder="10 000 00 000"
              value={values.phone}
              onChange={onChange('phone')}
            />
          </div>
          {helper('phone')}
        </div>

        <div className={wrap('message')}>
          <label htmlFor="inq-message" className="textfield__label">
            Your Inquiry
          </label>
          <div className="textfield__control rounded-inner h-auto items-start py-3">
            <textarea
              id="inq-message"
              rows={3}
              className="textfield__input resize-none"
              placeholder="Enter your inquiry"
              value={values.message}
              onChange={onChange('message')}
            />
          </div>
          {helper('message')}
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-main-primary text-main-white text-label-14 rounded-button h-12 font-medium disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Send Inquiry'}
        </button>

        <p role="status" className="text-caption-12 min-h-4">
          {status === 'sent' && (
            <span className="text-success-dark">
              Inquiry sent. The agent will reply by email or phone.
            </span>
          )}
          {status === 'failed' && (
            <span className="text-error-dark">
              We couldn't send your inquiry. Try again.
            </span>
          )}
        </p>
      </form>
    </aside>
  )
}
