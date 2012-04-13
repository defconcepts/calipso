/**
 * Mocha test case for core configuration library
 */
var should = require('should'),
    fs = require('fs'),
    rootpath = process.cwd() + '/',
    path = require('path'),
    exec = require('child_process').exec,
    Config = require('./helpers/require')('core/Config'),
    defaultConfig = {
      "test":"test",
      "modules": {
        "module":{
          "enabled":true
        }
      }
    };

describe('Configuration', function(){

  before(function(){
    // 
  });

  describe('Negative', function(){
    
    it('Invalid configuration type results in an exception', function(done){
        var conf = new Config({type:'invalid', env:'invalid', 'path': path.join(rootpath,'tmp')});                
        conf.init(function(err) {          
          err.message.should.equal('Cannot add store with unknown type: invalid');      
          // Delete the development.json
          fs.unlinkSync(path.join(rootpath,'tmp','invalid.json'));
          done();    
        });
    });

    it('Invalid default configuration results in an exception', function(done){
        var conf = new Config({env:'invalid', 'path': path.join(rootpath,'tmp'), 'defaultConfig':'invalid.json'});                
        conf.init(function(err) {
          err.message.should.equal('Unable to load configuration defined in invalid.json, there may be a problem with the default configuration in invalid.json')
          done()
        })
    });
 
    
  });

  describe('Positive', function(){

    it('I can create a new configuration file based on a default one.', function(done){

      mkdir(path.join(rootpath,'tmp'), function() {
        fs.writeFileSync(path.join(rootpath,'tmp','default.json'),JSON.stringify(defaultConfig));
        var conf = new Config({env:'development', 'path':path.join(rootpath,'tmp')});
        conf.type.should.equal('file');
        conf.file.should.equal(path.join(rootpath,'tmp','development.json'));
        done();
      });

    });

    it('I can store and retrieve configuration values', function(done){

      var conf = new Config({env:'development',path:path.join(rootpath,'tmp')});
      conf.init(function(err) {

        conf.set('test:v1','v1');
        conf.get('test:v1').should.equal('v1');
        conf.set('test:v2','v2');
        conf.get('test:v2').should.equal('v2');

        var test = conf.get('test');
        test.v1.should.equal('v1');
        test.v2.should.equal('v2');

        done();
        
      });

    });

    it('I can use different environments', function(done){

      var confTest = new Config({env:'test',path:path.join(rootpath,'tmp')});
      confTest.init(function(err) {
      
        confTest.set('test:v1','v1');
        confTest.get('test:v1').should.equal('v1');
        confTest.save(function(err) {
            path.existsSync(confTest.file);
            done();
        });        
      });


    });

    it('I can use the setSave shortcut', function(done){

      var conf = new Config({path:path.join(rootpath,'tmp')});
      conf.init(function(err) {

        conf.setSave('test:setsave','Yah!',function(err) {
            var confTest = new Config({path:path.join(rootpath,'tmp')});
            confTest.init(function(err) {
              confTest.get('test:setsave').should.equal('Yah!');
              done();  
            });            
        });        

      });
   
    });

  }); 

  describe('Modules', function(){

    it('I can set and retrieve module configuration', function(done){

      var conf = new Config({path:path.join(rootpath,'tmp')});
      conf.init(function(err) {
        conf.setModuleConfig('module','hello','world');
        var value = conf.getModuleConfig('module','hello');
        value.should.equal('world');
        done();
      });
      
    });

    it('I can set default module configuration', function(done){

      var conf = new Config({path:path.join(rootpath,'tmp')});
      
      conf.init(function(err) {
      
        var defaultConfig = { 
            "goodbye": {
              "default": "cruel world",
              "label": "Example",
              "description": "Example"                
            }
        };
          
        conf.setDefaultModuleConfig('module',defaultConfig);
        var value = conf.getModuleConfig('module','goodbye');
        value.should.equal('cruel world');
        done();
  
      });
      
    });

  });

  after(function() {
    fs.unlinkSync(path.join(rootpath,'tmp','default.json'));
    fs.unlinkSync(path.join(rootpath,'tmp','development.json'));
    fs.unlinkSync(path.join(rootpath,'tmp','test.json'));
  })

});

/**
 * Mkdir -p.
 *
 * TODO - these are unix only ...
 *
 * @param {String} path
 * @param {Function} fn
 */

function mkdir(path, fn) {
  exec('mkdir -p ' + path, function(err){
    if (err) throw err;
    fn && fn();
  });
}
