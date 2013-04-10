/*!
 * String.format
 *
 * Copyright (c) 2012 Kirollos Risk <kirollos@gmail.com>.
 * All Rights Reserved. Apache Software License 2.0
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
  String.formatWithEscapeFunction = function(escapeFunction) {
    return function formatEscapedInternal() {
        var str = this;
        var args = Array.prototype.slice.call(arguments, 0);

        if(!(this instanceof window.String)) {
          str = args.shift();
        }

        for (var i = 0; i < args.length; i++) {
          var reg = new RegExp("\\{" + i + "\\}", "gm");
          str = str.replace(reg, escapeFunction ? escapeFunction(args[i]) : args[i]);
        }
        return str;
    }
  };

  String.format = String.prototype.format = String.formatWithEscapeFunction(null);
})();