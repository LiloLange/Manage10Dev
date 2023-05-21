import React, { useState } from "react";
import { useSelector } from "react-redux";
import TodoDialog from "./TodoDialog";

const ShowTodos = () => {
  // get todo list from redux store
  const initialState = useSelector((state) => state.todoList);
  const [todolist, setTodolist] = useState(initialState);

  if (todolist.length === 0) {
    setTodolist([]);
    console.log("empty");
  }

  const handleOnClick = () => {
    console.log("clicked");
    TodoDialog();
  };
  // render todo list
  return (
    <>
      // render TodoDialog when click add button
      <button onClick={handleOnClick}>add</button>
      {/* {todoList.map((todo) => (
        <div key={todo.id}>{todo.text}</div>
      ))} */}
    </>
  );
};

export default ShowTodos;
