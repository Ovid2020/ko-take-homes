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
      reviews: []
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  alphabetizeMovies(movies) {
    return movies.sort((a,b) => {
      return a.title < b.title ? -1 : a.title > b.title ? 1 : 0;
    });
  }

  fetchData() {
    this.fetchReviews()
      .then(reviews => {
        this.reviews = reviews;
        return this.fetchMovies(reviews);
      })
      .then(movies => {
        this.allMovies = movies;
        this.setState({listViewMovies: movies})
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

  // The reviews and movies won't necessary maintain the same order, which 
  // would mean you'd have to keep looping through them to match the review
  // to its movie. Storing the reviews in the movie's data addresses this
  // problem.
  denormalizeReviewsIntoMovies(movies, reviews) {
    // Storing the movies in an object by the shared key with reviews will allow
    // matching movies and reviews to operate in O(n) time, as opposed to O(n^2)
    const movieDict = {};
    movies.forEach(movie => {
      movieDict[movie.id] = movie;        
    });
    reviews.forEach(review => {
      movieDict[review['movie-id']].review = review.review;
    });
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
      this.allMovies.forEach(movie => movie.containsSubstring = movie.title.indexOf(substring) > -1);
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
          filterByDecade={this.filterByDecade.bind(this)}
          filterBySubstring={this.filterBySubstring.bind(this)} />
        <MovieList movies={this.state.listViewMovies}/>
      </div>
    );
  }
}



