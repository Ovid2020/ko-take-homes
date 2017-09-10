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
    if (!event.target.classList.contains('do-not-collapse')) {
      this.setState({
        contentClassName: this.state.contentClassName === 'list-item-content' ? 'collapse' : 'list-item-content'
      })
    }
  }

  render() {
    return (
      <li className={`movie-list-item ${this.alternateDarkness()}`} onClick={this.toggleContentCollapse.bind(this)}>
        <a className='do-not-collapse' href={this.movie.url}>
          {Math.round(this.movie.score * 100)}% <i className='do-not-collapse'>{this.movie.title}</i> ({this.movie.year})
        </a>
        <div className={this.state.contentClassName}>
          <div className='movie-info'>
            <img src={this.movie['cover-url']}/>
            <div>
              <p className='movie-info-synopsis'>
                <label>Synopsis</label>
                {this.movie.synopsis}
              </p>
              <p>
                <label>Evan's Take</label>
                "{this.props.review}"
              </p>
            </div>
          </div>
        </div>
      </li>
    )
  }
}

