describe("Sigma.benchmark", function() {
  it("should run nothing 10 times in less than 2ms", function() {
    var result = Sigma.benchmark(function() {}, 10);
    expect(result).toBeLessThan(2);
  });
  
  it("should run sleep(3) in more than 2ms", function() {
    var result = Sigma.benchmark(function() {
      Sigma.sleep(3);
    }, 1);
    expect(result).toBeGreaterThan(2);
  });
  
});

describe("async_script_load", function() {
  it("should have loaded jquery asynchronously by now", function() {
    runs(function() {
      // dynamically load jquery for a test below
      Sigma.async_script_load('http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js');
    });
    
    waitsFor(function() {
      return window.jQuery;
    }, 2000); // wait up to 2s for jquery to be loaded.

    runs(function() {
      expect(window.jQuery21).not.toBeDefined(); // sanity test
      expect(window.jQuery).toBeDefined();
    });
  })
})

describe('wait_for_const_load', function() {
  // regression test.
  it("should default tries to 0 and call setTimeout the first time through", function() {
    var obj = {};
    obj.a_callback = function() {
    }
    spyOn(obj, 'a_callback');
    runs(function() {
      Sigma.wait_for_const_load('Woot', obj.a_callback);
    });

    runs(function() {
      window.Woot = 'asdf';
    });
    
    waits(100);
    
    runs(function() {
      expect(obj.a_callback).toHaveBeenCalledWith();
    });
  })

  it("should default keep trying until constant is set", function() {
    var obj = {};
    obj.a_callback = function() {
    }
    spyOn(obj, 'a_callback');
    runs(function() {
      Sigma.wait_for_const_load('Woot2', obj.a_callback);
    });

    waits(300);

    runs(function() {
      window.Woot2 = 'asdf';
    });
    
    waits(100);
    
    runs(function() {
      expect(obj.a_callback).toHaveBeenCalledWith();
    });
  })
})