using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PROD_DELIVERY_ATTR_VALUE")]
    public class ProdDeliveryAttrValue
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public string TicketImpCode { get; set; }
        public string ProdCode { get; set; }
        public string Code { get; set; }
        public string Value { get; set; }
        public string Unit { get; set; }
        public string MarkType { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
    }
}
