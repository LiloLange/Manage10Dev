// todoModal that shows a member of todo list
function todoModal({ type, modalOpen, setModalOpen, todo }) {
  // type is action type(delete, add, edit), show todo information to container when modalOpen is true, each value of todo is editable, setModalOpen(false) to close modal when modalOpen is false
  console.log(todo);
  return (
    <div>
      <button onClick={() => setModalOpen(!modalOpen)}></button>
      <arguments type={type} modalOpen={modalOpen} todo={todo}>
        {todo}
      </arguments>
    </div>
  );
}
export default todoModal;
