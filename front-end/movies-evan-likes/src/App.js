import React, { Component } from 'react';
import FilterOptions from './components/FilterOptions.js';
import MovieList from './components/MovieList.js';

const SERVER_URL = 'http://localhost:3000';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.allMovies = [];
    this.reviews = [];
    this.state = {
      listViewMovies: [],
      dropdownDecades: []
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  alphabetizeMovies(movies) {
    return movies.sort((a,b) => a.title < b.title ? -1 : a.title > b.title ? 1 : 0);
  }

  getDecades(movies) {
    const decadesDict = {};
    const decadesArray = [];
    // Only pushing decades that haven't yet been stored in the object ensures there aren't duplicates in the array
    movies.forEach(movie => {
      const decade = parseInt(movie.year / 10) * 10;
      if (!decadesDict[decade]) {
        decadesDict[decade] = 1;
        decadesArray.push(decade);
      }
    });
    return decadesArray.sort((a, b) => parseInt(a) > parseInt(b));
  }

  fetchData() {
    this.fetchReviews()
      .then(reviews => {
        this.reviews = reviews;
        return this.fetchMovies(reviews);
      })
      .then(movies => {
        this.allMovies = movies;
        this.setState({
          listViewMovies: movies,
          dropdownDecades: this.getDecades(movies)})
      })
      .catch(error => {
        console.error(`Error fetching data: ${error}`);
      })
  }

  fetchMovies(reviews) {
    return new Promise((resolve, reject) => {
      if (!!localStorage.hasOwnProperty('movies')) {
        return resolve(JSON.parse(localStorage.getItem('movies')));
      } else {
        axios.get(`${SERVER_URL}/movies`)
          .then(res => {
            let movies = this.denormalizeReviewsIntoMovies(res.data, reviews);
            movies = this.alphabetizeMovies(movies);
            localStorage.setItem('movies', JSON.stringify(movies))
            return resolve(movies);
          })
          .catch(error => {
            return reject(error);
          });
      }
    })
  }

  fetchReviews() {
    return new Promise((resolve, reject) => {
      if (!!localStorage.hasOwnProperty('reviews')) {
        return resolve(JSON.parse(localStorage.getItem('reviews')));
      } else {
        axios.get(`${SERVER_URL}/reviews`)
          .then(res => {
            localStorage.setItem('reviews', JSON.stringify(res.data));
            return resolve(res.data);
          })
          .catch(error => {
            return reject(error);
          });
      }
    });
  }

  // The reviews and movies won't necessary maintain the same order, especially 
  // since the reording via alphabetization of movies is independent of reviews. 
  // To avoid having to keep searching both movies and review arrays to match them, 
  // I'm storing the review in the movie to which it belongs.
  denormalizeReviewsIntoMovies(movies, reviews) {
    // Storing the movies in an object by the shared key with reviews will allow
    // matching movies and reviews to operate in O(n) time, as opposed to O(n^2)
    // 1. Put all movies in an object, keyed by their id
    const movieDict = {};
    movies.forEach(movie => movieDict[movie.id] = movie );
    // 2. Lookup a movie by the review's 'movie-id' (matches the movie's 'movie.id').
    //    Assign a 'review' field for the movie.
    reviews.forEach(review => movieDict[review['movie-id']].review = review.review);
    // 3. Convert the object to an array of movies that now have the reviews in them.
    const movieArray = [];
    for (let id in movieDict) {
      movieArray.push(movieDict[id]);
    }
    return movieArray;
  }

  filterByDecade(decade) {
    if (!parseInt(decade)) {
      this.allMovies.forEach(movie => movie.isInDecade = true);
      this.setState({listViewMovies: this.getOverlapAfterFilters()});
    } else {
      this.allMovies.forEach(movie => movie.isInDecade = movie.year - decade > 0 && movie.year - decade < 10);
      this.setState({listViewMovies: this.getOverlapAfterFilters()});
    }
  }

  filterBySubstring(substring) {
    if (substring.length < 2) {
      this.allMovies.forEach(movie => movie.containsSubstring = true);
      this.setState({listViewMovies: this.getOverlapAfterFilters()});
    } else {
      this.allMovies.forEach(movie => movie.containsSubstring = movie.title.toLowerCase().indexOf(substring.toLowerCase()) > -1);
      this.setState({listViewMovies: this.getOverlapAfterFilters()});
    }
  }

  getOverlapAfterFilters() {
    return this.allMovies.filter(movie => {
      // undefined is the default, means no filter was applied yet (so the movie is acceptable)
      return (movie.isInDecade || movie.isInDecade === undefined) &&
             (movie.containsSubstring || movie.containsSubstring === undefined);
    })
  }

  render() {
    return (
      <div className='page'>
        <div className='app-description'>
          <h1 className='app-description__title'>Movies Evan Likes!</h1>
          <p className='app-description__content'>
            Below is a (not) comprehensive list of movies that Evan really
            likes.
          </p>
        </div>
        <FilterOptions
          decades={this.state.dropdownDecades}
          filterByDecade={this.filterByDecade.bind(this)}
          filterBySubstring={this.filterBySubstring.bind(this)} />
        <MovieList movies={this.state.listViewMovies}/>
      </div>
    );
  }
}



