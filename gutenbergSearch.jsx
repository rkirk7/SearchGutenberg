const Pagination = ({ items, pageSize, onPageChange, currentPage }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num);
  const list = pages.map(page => {
    return (
      <p key={page} onClick={onPageChange} className={currentPage===page ? "pages selected" : "pages"}>
        {page}
      </p>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: true,
    isError: false,
    data: initialData
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
          console.log('success');
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
          console.log('fail');
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};

function App() {

  const { Table } = ReactBootstrap;
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    `http://gutendex.com/books`,
    {
      hits: []
    }
  );
  const handlePageChange = e => {
    setCurrentPage(Number(e.target.textContent));
  };
  if (data.results) {
  let page = data.results;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
  }
  
  return (
    <Fragment>
      <form
        onSubmit={event => {
          doFetch(`http://gutendex.com/books?search=${query}`);
          event.preventDefault();
        }}
      >
        <input
          type="text"
          value={query.replace('%20', ' ')}
          placeholder="Search by author or title"
          onChange={event => setQuery(event.target.value.replace(/\s+/g, '%20'))}
        />
        <button type="submit">Search</button>
      </form>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <div className="container">
        <Table className="table table-hover table-med table-bordered">
  <thead>
    <tr>
      <th scope="col">Author(s)</th>
      <th scope="col">Title</th>
      <th scope="col">Link</th>
    </tr>
  </thead>
  <tbody>
  {page.map(item => (
    <tr key={item.id}>
      <td>{`${item.authors
            .map(author => author.name)
            .join(" ; ")}`}</td>
       <td>{`${item.title}`}</td>
      <td><a href={item.formats['text/html']}>Read Here</a></td>
            </tr>
            ))}
  </tbody>

        </Table>
        </div>
      )}
      <div>
        <p>Page:</p>
      <Pagination
        items={data.results}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        currentPage={currentPage}
      ></Pagination>
       
      <p>Number of items per page:</p>
        <ul className="pagination">
 <p key="5" onClick={() => setPageSize(5)} className={pageSize === 5 ? 'pages selected' : 'pages'}>5</p>
 <p key="10" onClick={() => setPageSize(10)} className={pageSize === 10 ? 'pages selected' : 'pages'}>10</p>
 <p key="15" onClick={() => setPageSize(15)} className={pageSize === 15 ? 'pages selected' : 'pages'}>15</p>
 </ul>
 </div>

    </Fragment>
  );
} else {
  return (
  <div margin="0 auto">Loading ...</div>
  );
}
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
