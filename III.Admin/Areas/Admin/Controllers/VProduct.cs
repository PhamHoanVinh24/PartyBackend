
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("V_PRODUCT")]
    public class VProduct
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string Unit { get; set; }
        public string ProductCode { get; set; }
        public string UnitName { get; set; }
        public string AttributeCode { get; set; }
        public string AttributeName { get; set; }
        public string ProductType { get; set; }
    }
}
