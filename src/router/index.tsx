import React from "react";
import { Link, createBrowserRouter, RouterProvider } from "react-router-dom";
import ApiTest from "../components/api-test";
import SuraList from "../components/sura-list";
import WordGame from "../components/word-game";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ul style={{ fontSize: 24, lineHeight: 2 }}>
        <li><Link to="/api-test">Home</Link></li>
        <li><Link to="/suras">Sura List</Link></li>
      </ul>
    )
  },
  {
    path: "api-test",
    element: <ApiTest />
  },
  {
    path: "suras",
    element: <SuraList />
  },
  {
    path: "word-game",
    element: <WordGame />
  }
]);

export default () => <RouterProvider router={router} />;
