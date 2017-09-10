const FilterOptions = (props) => {
  return (
    <div className='filter-options-wrapper'>
      <div>
        <p>
          <span> Title contains: </span>
          <input placeholder='Search by title' onChange={((event) => props.filterBySubstring(event.target.value))} />
        </p>
      </div>
      <div>
        <p>
          <span> Decade: </span>
          <select defaultValue={null} onChange={((event) => props.filterByDecade(event.target.value))}>
            <option value={null}>Choose a Decade</option>
            <option value={0}>All</option>
            <option value={1960}>1960</option>
            <option value={1970}>1970</option>
            <option value={1980}>1980</option>
            <option value={1990}>1990</option>
            <option value={2000}>2000</option>
            <option value={2010}>2010</option>
          </select>
        </p>
      </div>  
    </div>
  )
};

export default FilterOptions;
