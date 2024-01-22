using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("AD_APP_FUNCTION")]
    public class AdAppFunction
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AppFunctionId { get; set; }

        [StringLength(50)]
        public string ApplicationCode { get; set; }
        [JsonIgnore]
        public virtual AdApplication Application { get; set; }

        [StringLength(50)]
        public string FunctionCode { get; set; }
        [JsonIgnore]
        public virtual AdFunction Function { get; set; }
    }
}