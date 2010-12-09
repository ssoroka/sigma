// dynamically load jquery for a test below
Sigma.async_script_load('http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js');

describe("Sigma.benchmark", function() {
  it("should run nothing 10 times in less than 1ms", function() {
    var result = Sigma.benchmark(function() {}, 10);
    expect(result).toBeLessThan(1);
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
    expect(window.jQuery21).not.toBeDefined();
    expect(window.jQuery).toBeDefined();
  })
})
