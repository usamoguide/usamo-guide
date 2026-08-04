import * as React from 'react';

export interface FigureBoxProps {
  image?: React.ReactNode | string;
  alt?: string;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  imageClassName?: string;
}

const FigureBox: React.FC<FigureBoxProps> = ({
  image,
  alt,
  title,
  children,
  className = '',
  imageClassName = '',
}) => {
  const renderedImage =
    typeof image === 'string' ? (
      <img
        src={image}
        alt={alt ?? ''}
        className={`block w-full object-cover ${imageClassName}`}
      />
    ) : (
      image
    );

  return (
    <figure className={`my-8 flex justify-center px-4 ${className}`.trim()}>
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white">
        {renderedImage && (
          <div
            className={
              typeof image === 'string'
                ? 'border-b border-gray-200 bg-white'
                : 'flex justify-center border-b border-gray-200 bg-white'
            }
            style={{ fontFamily: 'inherit' }}
          >
            {renderedImage}
          </div>
        )}
        <div className="px-6 py-5 text-gray-700">
          {title && (
            <div className="mb-2 text-center text-sm font-semibold tracking-wide text-gray-500 uppercase">
              {title}
            </div>
          )}
          <div className="no-y-margin">{children}</div>
        </div>
      </div>
    </figure>
  );
};

export default FigureBox;
