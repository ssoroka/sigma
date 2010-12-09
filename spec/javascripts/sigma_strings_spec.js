describe("String", function() {
  describe("underscore", function() {
    it("should change camel case to snake case", function() {
      expect(Sigma.string('ClassName').underscore()).toEqual('class_name')
    })

    it("should change titleize to snake case", function() {
      expect(Sigma.string('Class').underscore()).toEqual('class')
    })

    it("should mirror ruby's :: to / conversion ", function() {
      expect(Sigma.string('AModule::ClassName').underscore()).toEqual('a_module/class_name')
    })

    it("should handle nested paths for :: to / conversion ", function() {
      expect(Sigma.string('AModule::Parent::ClassName').underscore()).toEqual('a_module/parent/class_name')
    })
  })
})