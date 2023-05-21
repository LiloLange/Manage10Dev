import { createSlice } from "@reduxjs/toolkit";

export const todoActs = createSlice({
  name: "todo",
  initialState: [],
  reducers: {
    setFilterStatus: (state, action) => {},
    setTodoList: (state, action) => {
      window.localStorage.setItem("todoList", JSON.stringify(action.payload));
    },
    clearTodoList: (state, action) => {
      window.localStorage.setItem("todoList", JSON.stringify([]));
    },
    addTodo: (state, action) => {
      state.todoList.push(action.payload);
      window.localStorage.setItem("todoList", JSON.stringify(state.todoList));
      return state;
    },
    deleteTodo: (state, action) => {
      state.todoList.splice(action.payload, 1);
      window.localStorage.setItem("todoList", JSON.stringify(state.todoList));
      return;
    },
    editTodo: (state, action) => {
      state.todoList.splice(action.payload, 1, action.payload);
      window.localStorage.setItem("todoList", JSON.stringify(state.todoList));
      return state;
    },
  },
});

export const {
  setFilterStatus,
  setTodoList,
  clearTodoList,
  addTodo,
  deleteTodo,
} = todoActs.actions;
export default todoActs.reducer;
