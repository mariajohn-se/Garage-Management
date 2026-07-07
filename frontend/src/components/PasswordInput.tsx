import { useState, InputHTMLAttributes } from 'react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  toggleTestId?: string;
}

export function PasswordInput({ toggleTestId, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-input-wrap">
      <input {...props} type={visible ? 'text' : 'password'} autoComplete="off" className={className} />
      <button
        type="button"
        className="show-pw-toggle"
        data-testid={toggleTestId}
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
