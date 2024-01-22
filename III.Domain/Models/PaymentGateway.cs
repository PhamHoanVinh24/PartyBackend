using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PAYMENT_GATEWAY")]
    public class PaymentGateway
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(50)]
        public string ServiceType { get; set; }

        [StringLength(255)]
        public string Logo { get; set; }

        [StringLength(255)]
        public string GatewayCode { get; set; }

        [StringLength(255)]
        public string GatewayName { get; set; }

        [StringLength(255)]
        public string Email { get; set; }

        public string ConfigJson { get; set; }
				
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
    }
}
