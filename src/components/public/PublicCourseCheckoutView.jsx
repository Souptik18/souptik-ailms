import { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Landmark,
  Lock,
  QrCode,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react'
import styles from './PublicCourseCheckoutView.module.css'

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: QrCode },
  { id: 'credit-card', label: 'Credit Card', icon: CreditCard },
  { id: 'debit-card', label: 'Debit Card', icon: CreditCard },
  { id: 'netbanking', label: 'Net Banking', icon: Landmark },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
]

function formatCurrency(amount) {
  return `INR ${amount.toLocaleString('en-IN')}`
}

function sanitizeCardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 16)
}

function formatCardNumber(value) {
  return sanitizeCardNumber(value).replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

function sanitizeExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function sanitizeCvc(value) {
  return value.replace(/\D/g, '').slice(0, 4)
}

function PaymentFormSkeleton() {
  return (
    <div className={styles.formSkeleton} aria-hidden="true">
      <span className={styles.skeletonLineWide} />
      <span className={styles.skeletonInput} />
      <span className={styles.skeletonLineWide} />
      <span className={styles.skeletonInput} />
      <div className={styles.skeletonRow}>
        <span className={styles.skeletonInput} />
        <span className={styles.skeletonInput} />
      </div>
      <span className={styles.skeletonButton} />
    </div>
  )
}

function PublicCourseCheckoutView({
  course,
  authStateReady,
  currentUserRole,
  isEnrolled,
  onBack,
  onRegister,
  onLogin,
  onConfirmPayment,
  onOpenEnrolledCourse,
}) {
  const [activeMethod, setActiveMethod] = useState('upi')
  const [methodLoading, setMethodLoading] = useState(false)
  const [gatewayLoading, setGatewayLoading] = useState(true)
  const [upiId, setUpiId] = useState('')
  const [upiApp, setUpiApp] = useState('gpay')
  const [cardholderName, setCardholderName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvc, setCvc] = useState('')
  const [bankCode, setBankCode] = useState('HDFC')
  const [walletType, setWalletType] = useState('paytm')
  const [walletPhone, setWalletPhone] = useState('')
  const [country, setCountry] = useState('India')
  const [savePaymentMethod, setSavePaymentMethod] = useState(true)
  const [requireInvoice, setRequireInvoice] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const priceValue = Number(course?.price)
  const isPaidCourse = Number.isFinite(priceValue) && priceValue > 0
  const originalPriceValue = Number(course?.originalPrice)
  const originalPrice = isPaidCourse
    ? (Number.isFinite(originalPriceValue) && originalPriceValue > priceValue
      ? originalPriceValue
      : Math.round(priceValue * 1.9))
    : 0

  useEffect(() => {
    const timer = window.setTimeout(() => setGatewayLoading(false), 950)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    setMethodLoading(true)
    const timer = window.setTimeout(() => setMethodLoading(false), 380)
    return () => window.clearTimeout(timer)
  }, [activeMethod])

  const checkoutLockedReason = useMemo(() => {
    if (!authStateReady) return 'Checking account status...'
    if (!currentUserRole) return 'Sign in as student to continue payment.'
    if (currentUserRole !== 'student') return 'Payment is available only for student accounts.'
    if (isEnrolled) return 'You already have access to this course.'
    return ''
  }, [authStateReady, currentUserRole, isEnrolled])

  const canSubmitPayment = !checkoutLockedReason && isPaidCourse && !processing && !gatewayLoading && !methodLoading

  const validateMethodSpecificFields = () => {
    if (activeMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) return 'Enter a valid UPI ID.'
      return ''
    }

    if (activeMethod === 'credit-card' || activeMethod === 'debit-card') {
      const normalizedCardNumber = sanitizeCardNumber(cardNumber)
      const normalizedCvc = sanitizeCvc(cvc)
      const normalizedExpiry = expiryDate.replace(/\D/g, '')
      if (!cardholderName.trim()) return 'Cardholder name is required.'
      if (normalizedCardNumber.length !== 16) return 'Enter a valid 16-digit card number.'
      if (normalizedExpiry.length !== 4) return 'Enter expiry in MM/YY format.'
      const month = Number(normalizedExpiry.slice(0, 2))
      if (month < 1 || month > 12) return 'Expiry month must be between 01 and 12.'
      if (normalizedCvc.length < 3) return 'Enter a valid CVC.'
      return ''
    }

    if (activeMethod === 'netbanking') {
      if (!bankCode) return 'Select a bank to continue.'
      return ''
    }

    if (activeMethod === 'wallet') {
      if (!walletType) return 'Select a wallet provider.'
      if (!walletPhone.trim() || walletPhone.replace(/\D/g, '').length < 10) return 'Enter a valid mobile number.'
      return ''
    }

    return ''
  }

  const submitPayment = async (event) => {
    event.preventDefault()
    if (!canSubmitPayment) return

    const validationError = validateMethodSpecificFields()
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setProcessing(true)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 1400))
      onConfirmPayment?.(course.id)
    } finally {
      setProcessing(false)
    }
  }

  const renderMethodForm = () => {
    if (gatewayLoading || methodLoading) return <PaymentFormSkeleton />

    if (activeMethod === 'upi') {
      return (
        <div className={styles.form}>
          <label>
            <span>UPI App</span>
            <select value={upiApp} onChange={(event) => setUpiApp(event.target.value)}>
              <option value="gpay">Google Pay</option>
              <option value="phonepe">PhonePe</option>
              <option value="paytm">Paytm UPI</option>
              <option value="bhim">BHIM</option>
            </select>
          </label>
          <label>
            <span>UPI ID</span>
            <input
              type="text"
              value={upiId}
              onChange={(event) => setUpiId(event.target.value)}
              placeholder="name@bank"
            />
          </label>
          <article className={styles.upiHint}>
            <Smartphone size={16} />
            <p>You can also continue via UPI Intent or scan UPI QR from your app.</p>
          </article>
        </div>
      )
    }

    if (activeMethod === 'credit-card' || activeMethod === 'debit-card') {
      return (
        <div className={styles.form}>
          <label>
            <span>Cardholder name</span>
            <input
              type="text"
              value={cardholderName}
              onChange={(event) => setCardholderName(event.target.value)}
              placeholder="Name on card"
              autoComplete="cc-name"
            />
          </label>
          <label>
            <span>{activeMethod === 'credit-card' ? 'Credit card number' : 'Debit card number'}</span>
            <input
              type="text"
              inputMode="numeric"
              value={cardNumber}
              onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
              placeholder="1234 5678 9012 3456"
              autoComplete="cc-number"
            />
          </label>
          <div className={styles.inlineRow}>
            <label>
              <span>Expiry</span>
              <input
                type="text"
                inputMode="numeric"
                value={expiryDate}
                onChange={(event) => setExpiryDate(sanitizeExpiry(event.target.value))}
                placeholder="MM/YY"
                autoComplete="cc-exp"
              />
            </label>
            <label>
              <span>CVC</span>
              <input
                type="text"
                inputMode="numeric"
                value={cvc}
                onChange={(event) => setCvc(sanitizeCvc(event.target.value))}
                placeholder="CVC"
                autoComplete="cc-csc"
              />
            </label>
          </div>
          <label>
            <span>Billing country</span>
            <select value={country} onChange={(event) => setCountry(event.target.value)}>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
            </select>
          </label>
        </div>
      )
    }

    if (activeMethod === 'netbanking') {
      return (
        <div className={styles.form}>
          <label>
            <span>Bank</span>
            <select value={bankCode} onChange={(event) => setBankCode(event.target.value)}>
              <option value="HDFC">HDFC Bank</option>
              <option value="ICICI">ICICI Bank</option>
              <option value="SBI">State Bank of India</option>
              <option value="AXIS">Axis Bank</option>
              <option value="KOTAK">Kotak Mahindra Bank</option>
            </select>
          </label>
          <article className={styles.netBankingHint}>
            <Building2 size={16} />
            <p>You will be redirected to your bank for secure authentication and payment approval.</p>
          </article>
        </div>
      )
    }

    return (
      <div className={styles.form}>
        <label>
          <span>Wallet Provider</span>
          <select value={walletType} onChange={(event) => setWalletType(event.target.value)}>
            <option value="paytm">Paytm Wallet</option>
            <option value="mobikwik">MobiKwik</option>
            <option value="amazonpay">Amazon Pay</option>
            <option value="freecharge">Freecharge</option>
          </select>
        </label>
        <label>
          <span>Wallet Mobile Number</span>
          <input
            type="text"
            inputMode="numeric"
            value={walletPhone}
            onChange={(event) => setWalletPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit mobile number"
          />
        </label>
      </div>
    )
  }

  return (
    <section className={styles.screen}>
      <div className={styles.layout}>
        <article className={styles.paymentPanel}>
          <header className={styles.panelHeader}>
            <button type="button" className={styles.backButton} onClick={onBack}>
              Back to course
            </button>
            <span><Lock size={14} /> Secure Payment Gateway</span>
          </header>

          <div className={styles.headline}>
            <h1>Complete your enrollment</h1>
            <p>Choose your preferred payment method and complete checkout securely.</p>
          </div>

          {!authStateReady ? (
            <div className={styles.lockedState}>Checking account status...</div>
          ) : !currentUserRole ? (
            <div className={styles.authActions}>
              <button type="button" className={styles.primaryAction} onClick={onRegister}>Register</button>
              <button type="button" className={styles.secondaryAction} onClick={onLogin}>Sign In</button>
            </div>
          ) : currentUserRole !== 'student' ? (
            <div className={styles.lockedState}>Payment is available only for student accounts.</div>
          ) : isEnrolled ? (
            <div className={styles.authActions}>
              <button type="button" className={styles.primaryAction} onClick={() => onOpenEnrolledCourse?.(course.id)}>Open Course</button>
            </div>
          ) : !isPaidCourse ? (
            <div className={styles.lockedState}>This is a free course. Use direct enrollment.</div>
          ) : (
            <form className={styles.checkoutBody} onSubmit={submitPayment}>
              <section className={styles.methodRail}>
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.id}
                      type="button"
                      className={activeMethod === method.id ? styles.methodButtonActive : styles.methodButton}
                      onClick={() => setActiveMethod(method.id)}
                    >
                      <Icon size={15} />
                      {method.label}
                    </button>
                  )
                })}
              </section>

              <section className={styles.methodPanel}>
                {renderMethodForm()}

                <article className={styles.gatewaySettings}>
                  <h3>Gateway settings</h3>
                  <label className={styles.switchRow}>
                    <input
                      type="checkbox"
                      checked={savePaymentMethod}
                      onChange={(event) => setSavePaymentMethod(event.target.checked)}
                    />
                    <span>Save payment method for faster checkout</span>
                  </label>
                  <label className={styles.switchRow}>
                    <input
                      type="checkbox"
                      checked={requireInvoice}
                      onChange={(event) => setRequireInvoice(event.target.checked)}
                    />
                    <span>Request GST-compliant invoice</span>
                  </label>
                  <p><CheckCircle2 size={14} /> 3DS / OTP authentication will be applied where required.</p>
                </article>

                {error ? <p className={styles.errorText}>{error}</p> : null}

                <button type="submit" className={styles.payButton} disabled={!canSubmitPayment}>
                  <CreditCard size={16} />
                  {processing ? 'Processing payment...' : `Pay ${formatCurrency(priceValue)}`}
                </button>

                <p className={styles.secureNote}><ShieldCheck size={14} /> Card and account details are encrypted in transit.</p>
              </section>
            </form>
          )}
        </article>

        <aside className={styles.summaryPanel}>
          <h2>Order summary</h2>
          <article className={styles.courseSummary}>
            <strong>{course.title}</strong>
            <p>{course.subtitle}</p>
          </article>
          <div className={styles.priceRows}>
            <div>
              <span>List price</span>
              <strong>{isPaidCourse ? formatCurrency(originalPrice) : 'Free'}</strong>
            </div>
            <div>
              <span>Offer price</span>
              <strong>{isPaidCourse ? formatCurrency(priceValue) : 'Free'}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>Total</span>
              <strong>{isPaidCourse ? formatCurrency(priceValue) : 'Free'}</strong>
            </div>
          </div>
          <ul className={styles.summaryList}>
            <li>Lifetime access in learner workspace</li>
            <li>Certificate and progress tracking enabled</li>
            <li>Roadmap-aligned recommendations post enrollment</li>
          </ul>
        </aside>
      </div>
    </section>
  )
}

export default PublicCourseCheckoutView
