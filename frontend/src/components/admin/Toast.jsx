import { useEffect } from 'react'

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast show position-fixed bottom-0 end-0 m-3 bg-${type === 'success' ? 'success' : 'danger'} text-white`} 
         style={{ zIndex: 1100 }}>
      <div className="toast-body d-flex align-items-center">
        <i className={`fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
        {message}
        <button type="button" className="btn-close btn-close-white ms-auto" onClick={onClose}></button>
      </div>
    </div>
  )
}

export default Toast