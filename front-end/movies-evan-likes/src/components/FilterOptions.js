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
          <select defaultValue={0} onChange={((event) => props.filterByDecade(event.target.value))}>
            <option value={0}>All</option>
            {props.decades.map(decade => <option key={decade} value={decade}>{decade}</option> )}
          </select>
        </p>
      </div>  
    </div>
  )
};

export default FilterOptions;
