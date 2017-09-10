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
    this.fetchMovies();
    this.fetchReviews();
  }

  alphabetizeMovies(movies) {
    return movies.sort((a,b) => {
      return a.title < b.title ? -1 : a.title > b.title ? 1 : 0;
    });
  }

  fetchMovies() {
    if (!!localStorage.hasOwnProperty('movies')) {
      this.allMovies = JSON.parse(localStorage.getItem('movies'));
      this.setState({listViewMovies: this.allMovies});
    } else {
      axios.get(`${SERVER_URL}/movies`)
        .then(res => {
          this.allMovies = this.alphabetizeMovies(res.data);
          this.denormalizeReviewsIntoMovies();
          localStorage.setItem('movies', JSON.stringify(this.allMovies));
        })
        .catch(error => {
          console.error(`Error initializing movie data: ${error}`);
        });
    }
  }

  fetchReviews() {
    if (!!localStorage.hasOwnProperty('reviews')) {
      this.reviews = JSON.parse(localStorage.getItem('reviews'));
    } else {
      axios.get(`${SERVER_URL}/reviews`)
        .then(res => {
          this.reviews = res.data;
          this.denormalizeReviewsIntoMovies();
          localStorage.setItem('reviews', JSON.stringify(res.data));
        })
        .catch(error => {
          console.error(`Error initializing movie data: ${error}`);
        });
    }
  }

  // The reviews and movies won't necessary maintain the same order, which 
  // would mean you'd have to keep looping through them both to match the 
  // review to its movie. Storing the reviews in the movie's data removes this
  // problem.
  denormalizeReviewsIntoMovies() {
    // This condition means that the denormalization only occurs once both fetches
    // have completed. I didn't use an asynch chain pattern for the fetches so that 
    // they could be totally separate, allowing the caches to operate synchronously 
    // if for some reason one is set, but not the other
    if (this.allMovies.length > 0 && this.reviews.length > 0) {
      this.allMovies.forEach(movie => {
        this.reviews.forEach(review => {
          if (movie.id === review['movie-id']) {
            movie.review = review.review;
          }
        })
      });
    }
    this.setState({listViewMovies: this.allMovies});
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



