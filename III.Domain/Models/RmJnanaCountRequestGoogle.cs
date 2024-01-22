using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Models
{
    [Table("RM_JNANA_COUNT_REQUEST_GOOGLE")]
    public class RmJnanaCountRequestGoogle
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int NumRequest { get; set; }
        [StringLength(maximumLength: 255)]
        public string Device { get; set; }
        [StringLength(maximumLength: 50)]
        public string ServiceType { get; set; }
        public string Key { get; set; }
        public string Date { get; set; }      
        public DateTime CreateTime { get; set; }
        public DateTime UpdateTime { get; set; }
        public int IsLimit { get; set; }
    }
}
