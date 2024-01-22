using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Models
{
    [Table("RM_JNANA_API_GOOGLE_SERVICES")]
    public class RmJnanaApiGoogleServices
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(maximumLength: 250)]
        public string Key { get; set; }
        [StringLength(maximumLength: 250)]
        public string Description { get; set; }
        public int Limit { get; set; }
        [StringLength(maximumLength: 50)]
        public string ServiceType { get; set; }
    }
}
