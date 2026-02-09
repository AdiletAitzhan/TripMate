import { Modal } from './Modal'

type Props = { type: 'terms' | 'privacy'; onClose: () => void }

export function TermsPolicyModal({ type, onClose }: Props) {
  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy'
  const content = type === 'terms' ? (
    <div className="modal-content">
      <p>By creating an account you agree to our Terms and Privacy Policy. Use the service responsibly.</p>
    </div>
  ) : (
    <div className="modal-content">
      <p>We use your data to provide the service and send verification emails. We do not sell your data.</p>
    </div>
  )
  return <Modal title={title} onClose={onClose}>{content}</Modal>
}
