import { useState, useEffect } from "react";

const KEY = "585dc092";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      // callback?.();
      const controller = new AbortController(); // this is a browser API - stops the race conditions

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal } // part of the abort controller
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");

          const data = await res.json();
          if (data.Response === "false") throw new Error("Movie not found");

          setMovies(data.Search);
        } catch (err) {
          console.error(err.message);

          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }

        if (query.length < 3) {
          setMovies([]);
          setError("");
          return;
        }
      }

      fetchMovies();

      return function () {
        controller.abort(); // part of the abort controller to stop race conditions
      };
    },
    [query]
  );

  return { movies, isLoading, error };
}
