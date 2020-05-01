import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import get from 'lodash/get';
import { v4 as uuidv4 } from 'uuid';
import { TextInput, Button } from '@contentful/forma-36-react-components';
import { init } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-tokens/dist/css/index.css';
import './index.css';

const genItem = () => ({
  id: uuidv4(),
  coordinates: '',
});

export class App extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  };

  detachExternalChangeHandler = null;

  constructor(props) {
    super(props);

    this.state = {
      value: props.sdk.field.getValue() || [],
    };
  }

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();

    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    this.detachExternalChangeHandler = this.props.sdk.field.onValueChanged(this.onExternalChange);
  }

  componentWillUnmount() {
    if (this.detachExternalChangeHandler) {
      this.detachExternalChangeHandler();
    }
  }

  onSave = (value) => this.props.sdk.field.setValue(value);

  onExternalChange = (externalValue) => {
    this.setState((prevState) => ({
      value: externalValue ? externalValue : prevState.value,
    }));
  };

  onChange = (id, coordinates) => {
    this.setState((prevState) => {
      const value = prevState.value
        .map((item) => {
          if (item.id !== id) return item;

          return { ...item, coordinates };
        });

      this.onSave(value);

      return { value };
    });
  };

  onAddItem = () => {
    const item = genItem();

    this.setState((prevState) => {
      const value = [...prevState.value, item];

      this.onSave(value);

      return { value };
    })
  };

  onRemoveItem = (id) => {
    this.setState((prevState) => {
      const value = prevState.value
        .filter((item) => item.id !== id);

      this.onSave(value);

      return { value };
    })
  };

  render() {
    const value = get(this.state, 'value', []);

    return (
      <div className="Box">
        <div className="Box__content">
          {
            value.map((item) => (
              <div key={item.id} className="Box__item">
                <div className="Box__field">
                  <TextInput
                    width="medium"
                    type="text"
                    value={item.coordinates}
                    onChange={(event) => this.onChange(item.id, event.target.value)}
                  />
                </div>

                <div className="Box__remove">
                  <Button buttonType="negative" icon="Close" onClick={() => this.onRemoveItem(item.id)} />
                </div>
              </div>
            ))
          }
        </div>

        <div className="Box__footer">
          <Button buttonType="primary" onClick={this.onAddItem}>Add point</Button>
        </div>
      </div>
    );
  }
}

init(sdk => {
  ReactDOM.render(<App sdk={sdk} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
