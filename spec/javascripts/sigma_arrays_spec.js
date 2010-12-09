describe("Array#to_sentence", function() {
  it("should return '' for []", function() {
    expect(Sigma.array([]).to_sentence()).toEqual('');
  });

  it("should join one element properly", function() {
    expect(Sigma.array(['one']).to_sentence()).toEqual('one');
  });

  it("should join two elements properly", function() {
    expect(Sigma.array(['one', 'two']).to_sentence()).toEqual('one and two');
  });

  it("should join three elements properly", function() {
    expect(Sigma.array(['one', 'two', 'three']).to_sentence()).toEqual('one, two, and three');
  });

  it("should join many elements properly", function() {
    expect(Sigma.array(['one', 'two', 'three', 'four', 'five']).to_sentence()).toEqual('one, two, three, four, and five');
  });
})
