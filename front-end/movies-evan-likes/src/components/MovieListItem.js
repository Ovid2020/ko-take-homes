import React, { Component } from 'react';

export default class MovieListItem extends Component {
  constructor(props) {
    super(props);
    this.movie = props.movie;
    this.state = {
      contentClassName: 'collapse'
    };
  }

  alternateDarkness() {
    return this.props.index % 2 ? 'darker' : 'lighter';
  }

  toggleContentCollapse(event) {
    this.setState({
      contentClassName: this.state.contentClassName === 'list-item-content' ? 'collapse' : 'list-item-content'
    })
  }

  render() {
    return (
      <li className={`movie-list-item ${this.alternateDarkness()}`} onClick={this.toggleContentCollapse.bind(this)}>
        <a href={this.movie.url}>
          {Math.round(this.movie.score * 100)}% {this.movie.title} ({this.movie.year})
        </a>
        <div className={this.state.contentClassName}>
          <div className='movie-info'>
            <img src={this.movie['cover-url']}/>
            <p>
              {this.props.review}
            </p>
          </div>
        </div>
      </li>
    )
  }
}

