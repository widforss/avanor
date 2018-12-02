/**
 * @constructor
 */
function ControlUtils() {

  /**
   * @constructor
   */
  function Control(children) {
    var controlBox = document.createElement('div');
    controlBox.classList.add('controlBox');

    if (children) {
      for (var child of children) {
        if (typeof child == 'string' || child instanceof String) {
          var controlContent = document.createElement('div');
          controlContent.innerHTML = child;
          controlBox.appendChild(controlContent);
        } else {
          controlBox.appendChild(child);
        }
      }
    }

    function getDiv() {
      return controlBox;
    }
    this.getDiv = getDiv;
  }
  this.Control = Control;

  /**
   * @constructor
   */
  function Text(text) {
    var controlText = document.createElement('div');
    controlText.classList.add('controlText');
    controlText.innerHTML = text;

    function getText() {
      return controlText.innerHTML;
    }
    this.getText = getText;

    function setText(text) {
      controlText.innerHTML = text;
    }
    this.setText = setText;

    function getDiv() {
      return controlText;
    }
    this.getDiv = getDiv;
  }
  this.Text = Text;

  /**
   * @constructor
   */
  function Button(text, callback) {
    var controlButton = document.createElement('div');
    controlButton.classList.add('controlButton');
    var controlText = new Text(text);
    controlButton.appendChild(controlText.getDiv());

    if (callback) {
      controlButton.onclick = callback; 
      controlButton.classList.add('clickable');
    }

    function setText(text) {
      controlText.setText(text);
    }
    this.setText = setText;

    function getText() {
      return controlText.getText();
    }
    this.getText = getText;

    function getDiv() {
      return controlButton;
    }
    this.getDiv = getDiv;
  }
  this.Button = Button;

  /**
   * @constructor
   */
  function Select(options, callback) {
    var selectList = document.createElement("select");
    setOptions(options);
    if (callback) selectList.addEventListener('change', callback);
 
    function setOptions(options) {
      selectList.options.length = 0;
      for (var value of options) {
        var option = document.createElement("option");
        option.value = value;
        option.text = value;
        selectList.appendChild(option);
      }
      if (options.length > 1) {
        selectList.classList.add('multipleSelect');
      } else {
        selectList.classList.remove('multipleSelect');
      }
    }
    this.setOptions = setOptions;

    function setText(text) {
      selectList.classList.remove('multipleSelect');
      selectList.options.length = 0;
      var option = document.createElement("option");
      option.value = null;
      option.text = text;
      selectList.appendChild(option);
    }
    this.setText = setText;
 
    function getValue() {
      return selectList.children[selectList.selectedIndex].value;
    }
    this.getValue = getValue;

    function setValue(index) {
      if (index) selectList.value = selectList.children[index].value;
    }
    this.setValue = setValue;

    function setFunc(callback) {
      if (callback) selectList.addEventListener('change', callback);
    }
    this.setFunc = setFunc;

    function getDiv() {
      return selectList;
    }
    this.getDiv = getDiv;
  }
  this.Select = Select;
}

export {ControlUtils};
