import MovieListItem from './MovieListItem';

const MovieList = ({movies, reviews}) => {
  let index = -1;
  return (
    <div className='movie-list-wrapper'>
      <ul className='movie-list'>
        { movies.map(movie => {
            return (
              <MovieListItem
                key={movie.id}
                movie={movie}
                index={index++}
                review={movie.review}/>
            )
          })
        }
      </ul>
    </div>
  );
};

export default MovieList;
