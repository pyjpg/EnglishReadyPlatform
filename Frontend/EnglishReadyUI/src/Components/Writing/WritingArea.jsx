import PropTypes from 'prop-types';

const WritingArea = ({ textAreaRef }) => {
  return (
    <div className="flex-1 relative">
      <textarea
        ref={textAreaRef}
        className="absolute inset-0 w-full h-full p-4 text-lg border-t border-r border-b border-gray-200 border-l-4 border-l-blue-500 rounded-lg resize-none focus:ring-0 focus:outline-none"
        placeholder="Start writing your introduction here..."
        autoFocus
      />
    </div>
  );
};

WritingArea.propTypes = {
  textAreaRef: PropTypes.object.isRequired,
};

export default WritingArea;